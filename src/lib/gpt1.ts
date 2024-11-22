// Import Cohere SDK
const { CohereClient } = require('cohere-ai');

// Initialize Cohere client with API Key directly in method calls
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY, // Use your API key from environment
});

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strict_output1(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model: string = "command",  // Ensure this is the correct model ID
  temperature: number = 1,
  num_tries: number = 1,
  verbose: boolean = false
) {
  const list_input: boolean = Array.isArray(user_prompt);
  const dynamic_elements: boolean = /<.*?>/.test(JSON.stringify(output_format));
  const list_output: boolean = /\[.*?\]/.test(JSON.stringify(output_format));
  let error_msg: string = "";

  for (let i = 0; i < num_tries; i++) {
    let output_format_prompt: string = `You are to output ${
      list_output && "an array of objects in"
    } the following in json format: ${JSON.stringify(output_format)}.`;

    if (list_output) {
      output_format_prompt += `\nIf output field is a list, classify output into the best element of the list.`;
    }

    if (dynamic_elements) {
      output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example: Go to <location> -> Go to the garden.`;
    }

    if (list_input) {
      output_format_prompt += `\nGenerate an array of json, one json for each input element.`;
    }

    const full_prompt = system_prompt + output_format_prompt + error_msg;

    try {
      const response = await cohere.generate({
        model: model,
        prompt: full_prompt + "\nUser prompt: " + user_prompt.toString(),
        max_tokens: 1000,
        temperature: temperature,
      });

      console.log("Full API response:", response);  // Log full response for debugging

      let generatedText = response.generations[0].text;

      // Log the raw generated text for further debugging
      console.log("Raw generated text:", generatedText);
      console.log(generatedText[0])

      // Attempt to extract JSON using regex to capture curly braces { }
      const jsonMatch = generatedText.match(/{[\s\S]*}/);

      if (jsonMatch) {
        let jsonContent = jsonMatch[0].trim();

        // Log the extracted JSON content for verification
        console.log("Extracted JSON content:", jsonContent);

        // Replace single quotes with double quotes (if needed)
        jsonContent = jsonContent.replace(/'/g, '"');

        // Parse the cleaned JSON content
        let output = JSON.parse(jsonContent);

        if (list_input && !Array.isArray(output)) {
          output = [output]; // Wrap in an array if needed
        }

        // Process the output based on the given format
        for (let index = 0; index < output.length; index++) {
          for (const key in output_format) {
            if (/<.*?>/.test(key)) {
              continue;
            }

            if (!(key in output[index])) {
              throw new Error(`${key} not in json output`);
            }

            if (Array.isArray(output_format[key])) {
              const choices = output_format[key] as string[];
              if (Array.isArray(output[index][key])) {
                output[index][key] = output[index][key][0];
              }

              if (!choices.includes(output[index][key]) && default_category) {
                output[index][key] = default_category;
              }

              if (output[index][key].includes(":")) {
                output[index][key] = output[index][key].split(":")[0];
              }
            }
          }

          if (output_value_only) {
            output[index] = Object.values(output[index]);
            if (output[index].length === 1) {
              output[index] = output[index][0];
            }
          }
        }

        return output;

      } else {
        throw new Error("Failed to extract valid JSON from the response.");
      }
    } catch (e) {
      error_msg = `\n\nError message: ${e}`;
      console.log("An exception occurred:", e);
    }
  }

  return [];
}
