import { App, Modal, Notice } from "obsidian";
import { AppHelper } from "../app-helper";
import type { Word } from "../model/Word";
import CustomDictionaryWordAdd from "./component/CustomDictionaryWordAdd.svelte";

export class CustomDictionaryWordAddModal extends Modal {
  component: CustomDictionaryWordAdd;

  constructor(
    app: App,
    dictionaryPaths: string[],
    initialValue: string = "",
    dividerForDisplay: string = "",
    onSubmit: (dictionaryPath: string, word: Word) => void
  ) {
    super(app);
    const appHelper = new AppHelper(app);

    const dictionaries = dictionaryPaths.map((x) => ({ id: x, path: x }));

    const { contentEl } = this;
    this.component = new CustomDictionaryWordAdd({
      target: contentEl,
      props: {
        dictionaries,
        selectedDictionary: dictionaries[0],
        word: initialValue,
        dividerForDisplay,
        onSubmit: onSubmit,
        onClickFileIcon: (dictionaryPath: string) => {
          const markdownFile = appHelper.getMarkdownFileByPath(dictionaryPath);
          if (!markdownFile) {
            // noinspection ObjectAllocationIgnored
            new Notice(`Can't open ${dictionaryPath}`);
            return;
          }

          this.close();
          appHelper.openMarkdownFile(markdownFile, true);
        },
      },
    });
  }

  onClose() {
    super.onClose();
    this.component.$destroy();
  }
}