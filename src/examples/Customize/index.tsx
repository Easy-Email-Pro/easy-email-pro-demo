import { useMemo } from "react";
import {
  EmailEditorProvider,
  EmailTemplate,
  TextFormat,
} from "easy-email-pro-editor";
import { Retro, ThemeConfigProps } from "easy-email-pro-theme";
import "easy-email-pro-theme/lib/style.css";
import "@arco-themes/react-easy-email-pro-purple/css/arco.css";

import data from "./template.json";
import { EditorHeader } from "../../components/EditorHeader";
import { useUpload } from "../../hooks/useUpload";
import { Layout, Select } from "@arco-design/web-react";
import React from "react";

import { useState } from "react";

import localsData from "easy-email-pro-localization/locales/locales.json";
import { get } from "lodash";

import customizeCss from "./customize.scss?inline";
import { ElementToolsInner } from "./ElementToolsInner";
import { EditorTopBar } from "./EditorTopBar";

const hoveringToolbar: ThemeConfigProps["hoveringToolbar"] = {
  list({ isCollapsed, selection, isFocus }) {
    if (isCollapsed) return [];
    return [
      TextFormat.BOLD,
      TextFormat.ITALIC,
      TextFormat.UNDERLINE,
      TextFormat.STRIKETHROUGH,
      TextFormat.LINK,
    ];
  },
};

export default function MyEditor() {
  const { upload } = useUpload();
  const [lang, setLang] = useState<string>("en");

  const initialValues: EmailTemplate | null = useMemo(() => {
    return {
      subject: data.subject,
      content: data.content as EmailTemplate["content"],
    };
  }, []);

  const onUpload = (file: Blob): Promise<string> => {
    return upload(file);
  };

  const onSubmit = async (values: EmailTemplate) => {
    console.log(values);
  };

  const config = Retro.useCreateConfig({
    clientId: process.env.CLIENT_ID!,
    height: "calc(100vh - 66px)",
    onUpload,
    initialValues: initialValues,
    onSubmit: onSubmit,
    localeData: get(localsData, lang),
    ElementToolsInner: ElementToolsInner,
    showDragMoveIcon: true,
    showInsertTips: true,
    showSourceCode: true,
    showLayer: true,
    hoveringToolbar,
  });

  return (
    <EmailEditorProvider {...config}>
      <EditorHeader
        extra={
          <Select
            style={{ width: 120 }}
            value={lang}
            onChange={setLang}
            options={Object.keys(localsData).map((item) => {
              return {
                label: item,
                value: item,
              };
            })}
          ></Select>
        }
      />

      <Layout.Content>
        <Retro.Layout header={<EditorTopBar />}>
          <style id="customize-css">{customizeCss}</style>
        </Retro.Layout>
      </Layout.Content>
    </EmailEditorProvider>
  );
}
