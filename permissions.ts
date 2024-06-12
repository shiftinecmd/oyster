export interface AllPermissions {
  canReadConfig?: Deno.PermissionStatus,
  canReadEnv?: Deno.PermissionStatus,

  canReadAll?: Deno.PermissionStatus,
  canRunCommands?: Deno.PermissionStatus,
  canWriteConfig?: Deno.PermissionStatus,

  canAccessNetwork?: Deno.PermissionStatus,
}

export interface BasicPermissions extends AllPermissions {
  canReadConfig: Deno.PermissionStatus,
  canReadEnv: Deno.PermissionStatus,
};

export interface EssentialPermissions extends BasicPermissions {
  canReadAll: Deno.PermissionStatus,
  canRunCommands: Deno.PermissionStatus,
  canWriteConfig: Deno.PermissionStatus,
};

export interface FullPermissions extends EssentialPermissions {
  canAccessNetwork: Deno.PermissionStatus,
}

export function checkBasicPermissions(alertIfAllowed: boolean = false): BasicPermissions {
  const canReadConfig = Deno.permissions.requestSync({
    name: "read",
    path: "~/.shelly",
  });
  if (canReadConfig.state == "denied") {
    console.warn("(#_ ): You have denied access to our configuration directory on ~/.shelly. This entire Shelly session will be read-only.");
  } else if (canReadConfig.partial) {
    console.warn("(#_ ): You have allowed partial access to our configuration directory on ~/.shelly.");
  } else if (alertIfAllowed && canReadConfig.state == "granted") {
    console.info("(>_ ): You have allowed access to our configuration directory on ~/.shelly.");
  }

  const canReadEnv = Deno.permissions.requestSync({
    name: "env",
  });
  if (canReadEnv.state == "denied") {
    console.warn("(#_ ): You have denied access to environment variables. Some features will not work.");
  } else if (canReadEnv.partial) {
    console.warn("(#_ ): You have allowed partial access to environment variables. Some features may not work.");
  } else if (alertIfAllowed && canReadEnv.state == "granted") {
    console.info("(>_ ): You have allowed access to environment variables.");
  }

  return { canReadConfig, canReadEnv }
}

export function checkEssentialPermissions(alertIfAllowed: boolean = false): EssentialPermissions {
  const basicPermissions = checkBasicPermissions(alertIfAllowed);

  const canReadAll = Deno.permissions.requestSync({
    name: "read",
  });
  if (canReadAll.state == "denied") {
    console.warn("(#_ ): You have denied access to read any directory.");
  } else if (canReadAll.partial) {
    console.warn("(#_ ): You have allowed partial access to read any directory.");
  } else if (alertIfAllowed && canReadAll.state == "granted") {
    console.info("(>_ ): You have allowed access to read any directory.");
  }

  const canRunCommands = Deno.permissions.requestSync({
    name: "run",
  });
  if (canRunCommands.state == "denied") {
    console.warn("(#_ ): You have denied access to execute system commands. You will not be able to execute any external commands.");
  } else if (canRunCommands.partial) {
    console.warn("(#_ ): You have allowed partial access to execute system commands. You may not be able to execute any external commands.");
  } else if (alertIfAllowed && canRunCommands.state == "granted") {
    console.info("(>_ ): You have allowed access to execute system commands.");
  }

  const canWriteConfig = Deno.permissions.requestSync({
    name: "write",
    path: "~/.shelly/config.yaml",
  });
  if (canWriteConfig.state == "denied") {
    console.warn("(#_ ): You have denied access to write to configuration file at ~/.shelly/config.yaml. You will not be able to make any changes to Shelly's configuration.");
  } else if (canWriteConfig.partial) {
    console.warn("(#_ ): You have allowed partial access to write to configuration file at ~/.shelly/config.yaml. You may not be able to make any changes to Shelly's configuration.");
  } else if (alertIfAllowed && canWriteConfig.state == "granted") {
    console.info("(>_ ): You have allowed access to write to configuration file at ~/.shelly/config.yaml.");
  }
  return { ...basicPermissions, canReadAll, canRunCommands, canWriteConfig }
}

export function checkFullPermissions(alertIfAllowed: boolean = false): FullPermissions {
  const essentialPermissions = checkEssentialPermissions(alertIfAllowed);

  const canAccessNetwork = Deno.permissions.requestSync({
    name: "write",
    path: "~/.shelly/config.yaml",
  });
  if (canAccessNetwork.state == "denied") {
    console.warn("(#_ ): You have denied access to access the computer network. Shelly will run in offline mode.");
  } else if (canAccessNetwork.partial) {
    console.warn("(#_ ): You have allowed partial access to the computer network. Some of Shelly's function may fail.");
  } else if (alertIfAllowed && canAccessNetwork.state == "granted") {
    console.info("(>_ ): You have allowed access to the computer network.");
  }

  return { ...essentialPermissions, canAccessNetwork };
}