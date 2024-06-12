import { AllPermissions } from "./permissions.ts"

export type ShellyContext = {
    permissions: AllPermissions,
}
export type ShellyCommand = (context: ShellyContext) => ShellyCommandResponse;
export type ShellyCommandResponse = {
    err?: string,
    out?: string,
    warn?: string,
    code: number,
}
export type ShellyGoodResponse = ShellyCommandResponse & {
    out: string,
}
export type ShellyBadResponse = ShellyCommandResponse & {
    err: string,
}
export type ShellyCommandResolutionResponse = {
    found: boolean,
    response?: ShellyCommandResponse,
}

export async function resolveCommands(commandSplit: string[], context: ShellyContext): Promise<ShellyCommandResolutionResponse> {
    if (commandSplit.length == 0) {
        return { found: false };
    } else if (!commandSplit[0].startsWith("_")) {
        return { found: false };
    }
    const command = commandSplit[0].replace(/^_/, "");
    let foundCommand: ShellyCommand|undefined;
    try {
        foundCommand = await import(`./commands/${command}.ts`);
    } catch (e) {
        if (e instanceof TypeError) {
            return { found: false };
        }
    }
    if (!foundCommand) {
        return { found: false };
    }
    return {
        found: true,
        response: foundCommand(context),
    }
}
