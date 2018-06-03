export default class Parser {
    logLinkContent(link) {
        fetch(link)
            .then((r) => console.log(r))
    }
}