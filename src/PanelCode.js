import Gio from "gi://Gio";
import GObject from "gi://GObject";

import { makeDropdownFlat, settings as global_settings } from "./util.js";
import { setupRustProject } from "./langs/rust/rust.js";
import { setupTypeScriptProject } from "./langs/typescript/typescript.js";
import { setupJavascriptProject } from "./langs/javascript/javascript.js";

export default function PanelCode({
  builder,
  previewer,
  session: { settings, file },
  langs,
}) {
  const panel_code = builder.get_object("panel_code");
  const button_code = builder.get_object("button_code");
  const stack_code = builder.get_object("stack_code");

  const dropdown_code_lang = builder.get_object("dropdown_code_lang");
  makeDropdownFlat(dropdown_code_lang);

  settings.bind(
    "show-code",
    button_code,
    "active",
    Gio.SettingsBindFlags.DEFAULT,
  );
  button_code.bind_property(
    "active",
    panel_code,
    "visible",
    GObject.BindingFlags.SYNC_CREATE,
  );

  settings.bind(
    "code-language",
    dropdown_code_lang,
    "selected",
    Gio.SettingsBindFlags.DEFAULT,
  );
  dropdown_code_lang.connect("notify::selected-item", switchLanguage);

  settings.connect("changed::code-language", () => {
    global_settings.set_int(
      "recent-code-language",
      settings.get_int("code-language"),
    );
  });

  const panel = {
    panel: panel_code,
  };

  function switchLanguage() {
    panel.language = dropdown_code_lang.selected_item?.string;
    stack_code.visible_child_name = panel.language;
    previewer.useInternal().catch(console.error);

    if (panel.language.toLowerCase() === "javascript") {
      setupJavascriptProject(file, langs.javascript.document).catch(
        console.error,
      );
    }

    if (panel.language.toLowerCase() === "rust") {
      setupRustProject(file).catch(console.error);
    }

    if (panel.language.toLowerCase() === "typescript") {
      setupTypeScriptProject(file, langs.typescript.document).catch(
        console.error,
      );
    }
  }
  switchLanguage();

  return panel;
}
