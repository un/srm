#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deploy_1 = require("./deploy");
const pull_1 = require("./pull");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function printHelp() {
    console.log(`
Usage: srm <command> [options]

Commands:
  deploy    Deploy configuration to Stripe
  pull      Pull configuration from Stripe

Options:
  --config <path>    Path to the configuration file (default: srm.config.ts)
  --env <path>       Path to the .env file (default: .env)
  --help             Show this help message

Examples:
  srm deploy
  srm deploy --config custom-config.ts --env .env.production
  srm pull
  srm pull --config custom-config.ts --env .env.production
  `);
}
function parseOptions(args) {
    const options = {};
    for (let i = 1; i < args.length; i += 2) {
        if (args[i] === '--config') {
            options.config = args[i + 1];
        }
        else if (args[i] === '--env') {
            options.env = args[i + 1];
        }
    }
    return options;
}
function validateConfigPath(configPath) {
    const resolvedPath = path_1.default.resolve(process.cwd(), configPath);
    if (!fs_1.default.existsSync(resolvedPath)) {
        throw new Error(`Configuration file not found: ${resolvedPath}`);
    }
    return resolvedPath;
}
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    if (args.includes('--help') || !command) {
        printHelp();
        process.exit(0);
    }
    const options = parseOptions(args);
    try {
        switch (command) {
            case 'deploy':
                // Dynamically import ts-node only when needed
                const tsNode = await Promise.resolve().then(() => __importStar(require('ts-node')));
                tsNode.register({
                    compilerOptions: {
                        module: 'commonjs',
                    },
                });
                await (0, deploy_1.deploy)(options.config && validateConfigPath(options.config), options.env);
                break;
            case 'pull':
                await (0, pull_1.pull)(options.config && validateConfigPath(options.config), options.env);
                break;
            default:
                console.error(`Unknown command: ${command}`);
                printHelp();
                process.exit(1);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
            if (error.message.includes('Configuration file not found')) {
                console.error('Please make sure the configuration file exists and the path is correct.');
            }
        }
        else {
            console.error('An unexpected error occurred:', error);
        }
        process.exit(1);
    }
}
main().catch((error) => {
    console.error('Error executing SRM command:', error);
    process.exit(1);
});
