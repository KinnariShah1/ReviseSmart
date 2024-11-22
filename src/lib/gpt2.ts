const { CohereClient } = require('cohere-ai');  // Import Cohere SDK

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY, // Use your API key from environment
});

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strict_output(
    system_prompt: string,
    user_prompt: string | string[],
    output_format: OutputFormat,
    default_category: string = "",
    output_value_only: boolean = false,
    model: string = "command",
    temperature: number = 1,
    num_tries: number = 3,
    verbose: boolean = false
  ): Promise<string> {
    const list_input: boolean = Array.isArray(user_prompt);
    const dynamic_elements: boolean = /<.*?>/.test(JSON.stringify(output_format));
    const list_output: boolean = /\[.*?\]/.test(JSON.stringify(output_format));
    let error_msg: string = "";
  
    for (let i = 0; i < num_tries; i++) {
      let output_format_prompt = `\nYou are to output the following in JSON format: ${JSON.stringify(
        output_format
      )}. \nDo not put quotation marks or escape character \\ in the output fields.`;
      if (list_output) {
        output_format_prompt += `\nIf output field is a list, classify output into the best element of the list.`;
      }
      if (dynamic_elements) {
        output_format_prompt += `\nAny text enclosed by < and >...`; // Continue prompt
      }
      if (list_input) {
        output_format_prompt += `\nGenerate a list of JSON, one JSON for each input element.`;
      }
  
      // Use Cohere to get a response
      const response = await cohere.generate({
        model: model,
        prompt: system_prompt + output_format_prompt + error_msg + "\nUser: " + user_prompt.toString(),
        temperature: temperature,
        // stop_sequences: ["\n"],
      });
  
      console.log("Cohere API Response:", response); // Log full response
  
      if (response.generations && response.generations.length > 0) {
        let res = response.generations[0].text
        
        // Extract content inside the first JSON code block
        const startIndex = res.indexOf("```json") + 7;
        const endIndex = res.indexOf("```", startIndex);
        
        if (startIndex !== -1 && endIndex !== -1) {
          const jsonContent = res.slice(startIndex, endIndex).trim();
          console.log("Formatted JSON response:", jsonContent);
          
          // Return cleaned up JSON content
          return JSON.parse(jsonContent);
        } else {
          console.error("Error: JSON code block not found.");
          error_msg = `Error: No valid response from Cohere API`;
        }
      } else {
        console.error("No generations found in response", response.generations[0]);
        error_msg = `Error: No valid response from Cohere API`;
      }
    }
  
    return '';
  }
