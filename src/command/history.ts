import { CommandModule } from "yargs"

const historyCommand: CommandModule = {
    command: "history",
    describe: "show position history",
    handler: argv => {
        console.log(argv)
    },
}

export default historyCommand
