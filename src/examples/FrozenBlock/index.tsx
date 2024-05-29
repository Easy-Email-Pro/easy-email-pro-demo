import { useMemo } from "react";
import { EmailEditorProvider, EmailTemplate } from "easy-email-pro-editor";
import { Retro } from "easy-email-pro-theme";
import "easy-email-pro-theme/lib/style.css";
import "@arco-themes/react-easy-email-pro/css/arco.css";

import data from "./template.json";
import { EditorHeader } from "../../components/EditorHeader";
import { useUpload } from "../../hooks/useUpload";
import { Layout } from "@arco-design/web-react";
import React from "react";
import { Element } from "easy-email-pro-core";
import { useCompactMode } from "@/hooks/useCompactMode";

const headerElement: Element = {
  type: "standard-section",
  data: {},
  attributes: {
    "background-repeat": "no-repeat",
    "background-color": "#4a90e2",
  },
  children: [
    {
      type: "standard-column",
      attributes: {
        width: "100%",
      },
      data: {},
      children: [
        {
          name: "Text",
          type: "standard-paragraph",
          data: {},
          attributes: {},
          children: [
            {
              text: "FROZEN HEADER",
            },
          ],
        },
      ],
    },
  ],
};

const footerElement: Element = {
  type: "standard-section",
  data: {},
  attributes: {
    "background-repeat": "no-repeat",
    "background-color": "#4a90e2",
  },
  children: [
    {
      type: "standard-column",
      attributes: {
        width: "100%",
      },
      data: {},
      children: [
        {
          name: "Text",
          type: "standard-paragraph",
          data: {},
          attributes: {},
          children: [
            {
              text: "FROZEN FOOTER",
            },
          ],
        },
      ],
    },
  ],
};

export default function MyEditor() {
  const { upload } = useUpload();

  const initialValues: EmailTemplate | null = useMemo(() => {
    return {
      subject: data.subject,
      content: data.content as EmailTemplate["content"],
    };
  }, []);

  const onUpload = (file: Blob): Promise<string> => {
    return upload(file);
  };

  const onSubmit = (values: EmailTemplate) => {
    console.log(values);
  };

  const compact = useCompactMode();
  const config = Retro.useCreateConfig({
    clientId: process.env.CLIENT_ID!,
    height: "calc(100vh - 66px)",
    onUpload,
    initialValues: initialValues,
    onSubmit: onSubmit,

    unsplash: {
      clientId: process.env.UNSPLASH_CLIENT_ID!,
    },
    showLayer: true,
    compact: false,
    showDragMoveIcon: true,
    showInsertTips: true,
    headerElement: headerElement,
    footerElement: footerElement,
  });

  return (
    <EmailEditorProvider {...config}>
      <EditorHeader />

      <Layout.Content>
        <Retro.Layout></Retro.Layout>
      </Layout.Content>
    </EmailEditorProvider>
  );
}
