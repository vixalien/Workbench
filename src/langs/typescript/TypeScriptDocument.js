import { setup } from "./typescript.js";

import Document from "../../Document.js";
import { applyTextEdits } from "../../lsp/sourceview.js";

export class TypeScriptDocument extends Document {
  constructor(...args) {
    super(...args);

    this.lspc = setup({ document: this });
    this.code_view.lspc = this.lspc;
  }

  async format() {
    // https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_formatting
    const text_edits = await this.lspc.request("textDocument/formatting", {
      textDocument: {
        uri: this.file.get_uri(),
      },
      options: {
        tabSize: 2,
        insertSpaces: true,
        trimTrailingWhitespace: true,
        insertFinalNewline: true,
        trimFinalNewlines: true,
      },
    });

    applyTextEdits(text_edits, this.buffer);
  }
}
