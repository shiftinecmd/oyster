import { cliffy } from "./deps.ts";

import { AllPermissions, BasicPermissions, EssentialPermissions, checkBasicPermissions, checkEssentialPermissions } from "./permissions.ts";

export type ProgramOptions = {
  safeMode?: true | undefined;
}

async function main(options: ProgramOptions, ..._args: []) {
  let permissions: AllPermissions = options.safeMode ? (checkBasicPermissions()) : checkEssentialPermissions();
  let cwd: string|undefined = (permissions.canReadAll?.state == "granted") ? Deno.cwd() : undefined;

  while (true) {
    const command = await cliffy.prompt.Input.prompt("You: ");
    const cleanedCommand = command.replaceAll(/^\s+/g, "").replaceAll(/\s+$/g, "").replaceAll(/\s+/g, " ");
    const commandSplit = cleanedCommand.split(" ");
    // console.log(commandSplit);
    if (commandSplit.length > 0) {
      switch (commandSplit[0]) {
        case "exit":
        case "logout":
        case "_exit":
        case "_logout":
          console.log("(>_ ): Bye!");
          return;
        case "_cwd":
          console.log(cwd);
          break;
        default:
          if (options.safeMode) {
            const leaveSafeMode = await cliffy.prompt.Confirm.prompt("You are currently in Safe Mode. Do you want to leave?");
            if (leaveSafeMode) {
              permissions = checkEssentialPermissions();
            }
          } else if (permissions.canRunCommands?.state == "granted") {
            const command = new Deno.Command(commandSplit[0], {
              args: [...commandSplit.slice(1)],
              cwd: cwd,
            });
            const spawn = command.spawn();
            spawn.ref();
            await spawn.output();
          }
      }
    }
  }
}

await new cliffy.command.Command()
  .name("shelly")
  .version("0.1.0")
  .description("Command line framework for Deno")
  .globalOption("-s, --safe-mode", "Enable safe mode.")
  .action(main)
  // TODO: Add potential subcommands
  // Execute
  .parse(Deno.args);
