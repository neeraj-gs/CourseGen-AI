import OpenAI from "openai";
import { env } from "./env";

// Created on first use rather than at import time, so `next build` can import
// this module on a machine with no secrets.
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return client;
}

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

/**
 * Asks the model for JSON in a specific shape and keeps retrying — feeding the
 * parse/validation error back into the prompt — until the shape is satisfied.
 *
 * Throws after `num_tries` failed attempts so callers can return a real error
 * instead of silently continuing with an empty result.
 */
export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat, // the shape of the JSON we want back
  default_category: string = "",
  output_value_only: boolean = false,
  model: string = "",
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
): Promise<any> {
  // if the user input is a list, we also process the output as a list of json
  const list_input: boolean = Array.isArray(user_prompt);
  // if the output format contains dynamic elements of < or >, then add to the prompt to handle dynamic elements
  const dynamic_elements: boolean = /<.*?>/.test(JSON.stringify(output_format));
  // if the output format contains list elements of [ or ], then we add to the prompt to handle lists
  const list_output: boolean = /\[.*?\]/.test(JSON.stringify(output_format));

  const resolved_model = model || env.OPENAI_MODEL;

  let error_msg: string = "";
  let last_error: unknown = null;

  for (let i = 0; i < num_tries; i++) {
    let output_format_prompt: string = `\nYou are to output ${
      list_output ? "an array of objects in" : ""
    } the following in json format: ${JSON.stringify(
      output_format
    )}. \nDo not put quotation marks or escape character \\ in the output fields.`;

    if (list_output) {
      output_format_prompt += `\nIf output field is a list, classify output into the best element of the list.`;
    }

    if (dynamic_elements) {
      output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden\nAny output key containing < and > indicates you must generate the key name to replace it. Example input: {'<location>': 'description of location'}, Example output: {school: a place for education}`;
    }

    if (list_input) {
      output_format_prompt += `\nGenerate an array of json, one json for each input element.`;
    }

    // The chat completions JSON mode below always returns a top-level object,
    // so when we want an array we ask for it under a known key and unwrap it.
    if (list_input) {
      output_format_prompt += `\nReturn the array under a top level key named "output", i.e. {"output": [ ... ]}.`;
    }

    let res = "";

    try {
      const response = await getClient().chat.completions.create({
        model: resolved_model,
        temperature,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: system_prompt + output_format_prompt + error_msg,
          },
          {
            role: "user",
            content: Array.isArray(user_prompt)
              ? user_prompt.join("\n\n")
              : user_prompt,
          },
        ],
      });

      res = response.choices[0]?.message?.content ?? "";

      if (verbose) {
        console.log(
          "System prompt:",
          system_prompt + output_format_prompt + error_msg
        );
        console.log("\nUser prompt:", user_prompt);
        console.log("\nGPT response:", res);
      }

      let output: any = JSON.parse(res);

      if (list_input) {
        // JSON mode hands back an object, so dig out the array it wraps.
        if (!Array.isArray(output)) {
          output = unwrapArray(output);
        }
        if (!Array.isArray(output)) {
          throw new Error("Output format not in an array of json");
        }
      } else {
        output = [output];
      }

      // check that each element of the output adheres to the requested format
      for (let index = 0; index < output.length; index++) {
        for (const key in output_format) {
          // unable to ensure accuracy of dynamic output header, so skip it
          if (/<.*?>/.test(key)) {
            continue;
          }

          if (!(key in output[index])) {
            throw new Error(`${key} not in json output`);
          }

          // check that one of the choices given for the list of words is an unknown
          if (Array.isArray(output_format[key])) {
            const choices = output_format[key] as string[];
            // ensure output is not a list
            if (Array.isArray(output[index][key])) {
              output[index][key] = output[index][key][0];
            }
            // output the default category (if any) if GPT is unable to identify the category
            if (!choices.includes(output[index][key]) && default_category) {
              output[index][key] = default_category;
            }
            // if the output is a description format, get only the label
            if (
              typeof output[index][key] === "string" &&
              output[index][key].includes(":")
            ) {
              output[index][key] = output[index][key].split(":")[0];
            }
          }
        }

        if (output_value_only) {
          output[index] = Object.values(output[index]);
          // just output without the list if there is only one element
          if (output[index].length === 1) {
            output[index] = output[index][0];
          }
        }
      }

      return list_input ? output : output[0];
    } catch (e) {
      last_error = e;
      error_msg = `\n\nResult: ${res}\n\nError message: ${e}`;
      console.error(`strict_output attempt ${i + 1}/${num_tries} failed:`, e);
    }
  }

  throw new Error(
    `The AI failed to return valid JSON after ${num_tries} attempts: ${last_error}`
  );
}

/**
 * JSON mode always returns an object. When we asked for a list, the model
 * usually nests it under "output" but sometimes invents its own key — so fall
 * back to the first array-valued property we find.
 */
function unwrapArray(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj.output)) return obj.output;
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) return value;
  }
  return obj;
}
