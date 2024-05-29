import { useMemo } from "react";
import { TextFormat, useSelectedNode } from "easy-email-pro-editor";
import { SharedComponents } from "easy-email-pro-theme";

import { Tooltip } from "@arco-design/web-react";
import React from "react";

import { NodeUtils, t } from "easy-email-pro-core";
import { EmojiPlugin } from "easy-email-pro-plugins";
import customizeTopBarCss from "./customize-top-bar.scss?inline";
import { useSlate } from "slate-react";
import { IconRedo, IconUndo } from "@arco-design/web-react/icon";
import { Editor, Range } from "slate";

export const EditorTopBar: React.FC = () => {
  const { selectedNode } = useSelectedNode();
  const editor = useSlate();

  const undoable = editor.history.undos.length > 1;
  const redoable = editor.history.redos.length > 0;

  const list = useMemo((): Array<TextFormat | React.FC> => {
    const selection = editor.selection;
    const isCollapsed = Boolean(
      selection &&
        (Range.isCollapsed(selection) ||
          Editor.string(editor, selection) === "")
    );

    return [
      () => (
        <span className="controller-item" data-enable={undoable}>
          <Tooltip position="top" content={t("Undo")}>
            <IconUndo width={40} onClick={editor.undo} />
          </Tooltip>
        </span>
      ),

      () => (
        <span className="controller-item" data-enable={redoable}>
          <Tooltip position="top" content={t("Redo")}>
            <IconRedo width={40} onClick={editor.redo} />
          </Tooltip>
        </span>
      ),
      TextFormat.FONT_FAMILY,
      TextFormat.FONT_SIZE,
      TextFormat.BOLD,
      TextFormat.ITALIC,
      TextFormat.UNDERLINE,
      TextFormat.STRIKETHROUGH,
      TextFormat.ALIGN,
      TextFormat.TEXT_COLOR,
      TextFormat.BACKGROUND_COLOR,
      TextFormat.LINK,
      TextFormat.MERGETAG,
      () => <EmojiPlugin />,
      TextFormat.REMOVE_FORMAT,
    ];
  }, [editor, redoable, undoable]);

  if (selectedNode && NodeUtils.isTextElement(selectedNode)) {
    return (
      <div
        className="EditorTopBar"
        style={{
          border: "1px solid #ccc",
          padding: "5px 10px",
          position: "absolute",
          backgroundColor: "#fff",
          width: "100%",
          top: 0,
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
        }}
        onClick={(e) => {
          // prevent toolbar from taking focus away from editor
          e.stopPropagation();
        }}
      >
        <SharedComponents.RichTextBar list={list} />
        <style id="customize-editor-css">{customizeTopBarCss}</style>
        <style>
          {`.EditorTopBar {
          --hovering-bar-icon-size: 16px;

        }`}
        </style>
      </div>
    );
  }
  return null;
};
