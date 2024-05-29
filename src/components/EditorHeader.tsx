import {
  Button,
  Dropdown,
  Input,
  Layout,
  Menu,
  Message,
  Modal,
  PageHeader,
  Space,
  Typography,
} from "@arco-design/web-react";
import { IconLeft, IconMenu } from "@arco-design/web-react/icon";
import React from "react";
import { EmailTemplate, useEditorProps } from "easy-email-pro-editor";
import { mjmlToJson, useEditorContext } from "easy-email-pro-theme";
import {
  EditorCore,
  PluginManager,
  easyEmailToEasyEmailPro,
} from "easy-email-pro-core";
import { navigation } from "../main";
import mjml from "mjml-browser";
import { saveAs } from "file-saver";
import { Uploader } from "@/utils/Uploader";
import { pick } from "lodash";
import { ReactEditor, useSlate } from "slate-react";
import { useSearchParams } from "react-router-dom";

export const EditorHeader = (props: {
  extra?: React.ReactNode;
  hideImport?: boolean;
  hideExport?: boolean;
}) => {
  const editor = useSlate();
  const [collapsed, setCollapsed] = React.useState(true);
  const [text, setText] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const { values, submit, setFieldValue, mergetagsData, reset, dirty } =
    useEditorContext();

  const onChange = (text: string) => {
    setFieldValue(null, "subject", text);
  };

  const { universalElementSetting } = useEditorProps();
  const [params] = useSearchParams();

  const isDev = params.get("dev") === "true";

  const onExportImage = async () => {
    Message.loading("Loading...");
    const html2canvas = (await import("html2canvas")).default;
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    const mjmlStr = EditorCore.toMJML({
      element: values.content,
      mode: "production",
      universalElements: universalElementSetting,
    });

    const html = PluginManager.renderWithData(
      mjml(mjmlStr).html,
      mergetagsData
    );

    container.innerHTML = html;
    document.body.appendChild(container);

    const blob = await new Promise<any>((resolve) => {
      html2canvas(container, { useCORS: true }).then((canvas) => {
        return canvas.toBlob(resolve, "png", 0.1);
      });
    });
    saveAs(blob, "demo.png");
    Message.clear();
  };
  const onExportPDF = async () => {
    const printCSS = document.createElement("style");
    printCSS.innerHTML = `
    @media print {
      body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
      }
    }
  `;

    const contentWindow = ReactEditor.getWindow(editor);
    if (contentWindow) {
      contentWindow.document.body.appendChild(printCSS);
      contentWindow.print();
      printCSS.parentElement?.removeChild(printCSS);
    }
  };

  const onExportJSON = () => {
    navigator.clipboard.writeText(
      JSON.stringify(pick(values, ["subject", "content"]), null, 2)
    );
    saveAs(
      new Blob(
        [JSON.stringify(pick(values, ["content", "subject"]), null, 2)],
        { type: "application/json" }
      ),
      "easy-email-pro.json"
    );
  };

  const onExportMJML = () => {
    const mjmlStr = EditorCore.toMJML({
      element: values.content,
      mode: "production",
      universalElements: universalElementSetting,
      beautify: true,
    });

    navigator.clipboard.writeText(mjmlStr);
    saveAs(new Blob([mjmlStr], { type: "text/mjml" }), "easy-email-pro.mjml");
  };

  const onExportHTML = () => {
    const mjmlStr = EditorCore.toMJML({
      element: values.content,
      mode: "production",
      universalElements: universalElementSetting,
      beautify: true,
    });

    const html = mjml(mjmlStr).html;
    navigator.clipboard.writeText(html);
    saveAs(new Blob([html], { type: "text/html" }), "easy-email-pro.html");
  };

  const onImportMJML = async () => {
    const uploader = new Uploader(() => Promise.resolve(""), {
      accept: "text/mjml",
      limit: 1,
    });

    const [file] = await uploader.chooseFile();
    const reader = new FileReader();
    const pageData = await new Promise<[string, EmailTemplate["content"]]>(
      (resolve, reject) => {
        reader.onload = function (evt) {
          if (!evt.target) {
            reject();
            return;
          }
          try {
            const pageData = mjmlToJson(evt.target.result as any);
            resolve([file.name, pageData]);
          } catch (error) {
            reject();
          }
        };
        reader.readAsText(file);
      }
    );

    reset({
      subject: pageData[0],
      content: pageData[1],
    });
  };

  const onImportJSON = async () => {
    const uploader = new Uploader(() => Promise.resolve(""), {
      accept: "application/json",
      limit: 1,
    });

    const [file] = await uploader.chooseFile();
    const reader = new FileReader();
    const emailTemplate = await new Promise<EmailTemplate>(
      (resolve, reject) => {
        reader.onload = function (evt) {
          if (!evt.target) {
            reject();
            return;
          }
          try {
            const template = JSON.parse(
              evt.target.result as any
            ) as EmailTemplate;
            resolve(template);
          } catch (error) {
            reject();
          }
        };
        reader.readAsText(file);
      }
    );

    reset({
      subject: emailTemplate.subject,
      content: emailTemplate.content,
    });
  };

  const onImportEasyEmailJSON = async () => {
    const uploader = new Uploader(() => Promise.resolve(""), {
      accept: "application/json",
      limit: 1,
    });

    const [file] = await uploader.chooseFile();
    const reader = new FileReader();
    const emailTemplate = await new Promise<EmailTemplate>(
      (resolve, reject) => {
        reader.onload = function (evt) {
          if (!evt.target) {
            reject();
            return;
          }
          try {
            const template = JSON.parse(evt.target.result as any);
            const content = easyEmailToEasyEmailPro(template.content);
            if (!template.content) {
              Message.error(`Invalid template, need content params`);
              reject();
              return;
            }

            resolve({
              subject: template.subject,
              content: content,
            });
          } catch (error) {
            console.log(error);
            reject();
          }
        };
        reader.readAsText(file);
      }
    );

    reset({
      subject: emailTemplate.subject,
      content: emailTemplate.content,
    });
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <PageHeader
          backIcon={<IconMenu />}
          onBack={() => setCollapsed(!collapsed)}
          className="editor-header"
          style={{
            backgroundColor: "rgb(var(--primary-6))",
            color: "#fff !important",
            height: 66,
          }}
          subTitle={
            <div
              style={{
                height: 40,
                position: "absolute",
                minWidth: 300,
                top: 18,
              }}
            >
              <Typography.Title
                heading={5}
                style={{
                  margin: 0,
                  color: "var(--color-white)",
                }}
                editable={{
                  onChange: onChange,
                }}
              >
                {values.subject}
              </Typography.Title>
            </div>
          }
          extra={
            <div style={{ marginRight: 0 }}>
              <Space>
                {props?.extra}

                {!props.hideImport && isDev && (
                  <Dropdown
                    droplist={
                      <Menu>
                        <Menu.Item key="MJML" onClick={onImportMJML}>
                          Import from MJML
                        </Menu.Item>

                        <Menu.Item key="JSON" onClick={onImportJSON}>
                          Import from JSON
                        </Menu.Item>
                        <Menu.Item
                          key="Easy Email JSON"
                          onClick={onImportEasyEmailJSON}
                        >
                          Import from Easy Email JSON
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Button>
                      <strong>Import</strong>
                    </Button>
                  </Dropdown>
                )}

                {!props.hideExport && (
                  <Dropdown
                    droplist={
                      <Menu>
                        <Menu.Item key="Export MJML" onClick={onExportMJML}>
                          Export MJML
                        </Menu.Item>
                        <Menu.Item key="Export HTML" onClick={onExportHTML}>
                          Export HTML
                        </Menu.Item>
                        <Menu.Item key="Export JSON" onClick={onExportJSON}>
                          Export JSON
                        </Menu.Item>
                        <Menu.Item key="Export Image" onClick={onExportImage}>
                          Export Image
                        </Menu.Item>
                        <Menu.Item key="Export PDF" onClick={onExportPDF}>
                          Export PDF
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Button>
                      <strong>Export</strong>
                    </Button>
                  </Dropdown>
                )}

                {/* <Button disabled={!dirty} onClick={() => submit()}>
                  <strong>Submit</strong>
                </Button> */}
                {/* <SendEmailModal /> */}
                <Button
                  target="_blank"
                  href="https://docs.easyemail.pro/docs/intro?utm_source=demo"
                >
                  <strong>Docs</strong>
                </Button>
                <Button
                  target="_blank"
                  href="https://www.easyemail.pro/?#trial?utm_source=demo"
                >
                  <strong>Start Trial</strong>
                </Button>
                <div />
              </Space>
            </div>
          }
        />
        <Layout.Sider
          theme="dark"
          onCollapse={setCollapsed}
          collapsed={collapsed}
          width={250}
          collapsible
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            height: "100vh",
            zIndex: 100,
            maxWidth: collapsed ? 0 : 250,
          }}
        >
          <Menu theme="dark">
            <Menu.Item key={"Home"}>
              <a href={"/"} style={{ display: "block" }}>
                <IconLeft /> Back to Home
              </a>
            </Menu.Item>
            {navigation.map((item, index) => {
              return (
                <Menu.Item key={index.toString()}>
                  <a href={item.path} style={{ display: "block" }}>
                    {item.name}
                  </a>
                </Menu.Item>
              );
            })}
          </Menu>
        </Layout.Sider>
      </div>

      <style>{`
      .editor-header .arco-page-header-back { color: var(--color-white); }
      .editor-header .arco-page-header-back:hover:before { background-color: transparent !important; }
      .editor-header .arco-typography-operation-edit { color: var(--color-white); }
      .editor-header .arco-typography-operation-edit { color: var(--color-white);background-color: transparent; }
      .editor-header .arco-typography-operation-edit:hover { color: var(--color-white);background-color: transparent; }
      `}</style>

      <Modal
        visible={visible}
        title="Import"
        onCancel={() => setVisible(false)}
      >
        <Input.TextArea value={text} onChange={setText} rows={10} />
      </Modal>
      {/* <AutoSaveAndRestore name="temp" /> */}
    </>
  );
};
