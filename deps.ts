import * as cliffyCommand from "@cliffy/command";
import * as cliffyPrompt from "@cliffy/prompt";

export const cliffy = {
    command: cliffyCommand,
    prompt: cliffyPrompt,
}

export {default as os} from "https://deno.land/x/dos@v0.11.0/mod.ts";