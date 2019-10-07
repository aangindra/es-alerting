const axios = require("axios");

let discordWebhookUrl = "";

const sendMessageToReportingChannel = async message => {
  if (!!discordWebhookUrl) {
    try {
      const res = await axios.post(discordWebhookUrl, {
        content: message
      });
      console.log("res", res);
    } catch (err) {
      const { response } = err;
      const { status, statusText, data } = response;
      // console.log({
      //   status,
      //   statusText,
      //   data
      // });
      console.log("Error message", data.content);
      if (status !== 200) {
        throw new Error(
          `Discord Webhook Error ${status} - ${statusText}: ${data.content}`
        );
      }
    }
  }
};
exports.sendMessageToReportingChannel = sendMessageToReportingChannel;

const camelCaseToRegularText = text => {
  const result = text.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};
exports.camelCaseToRegularText = camelCaseToRegularText;

const sendReportResult = async (result, level) => {
  if (!level) {
    level = 0;
  }
  let messages = [];
  for (const key of Object.keys(result)) {
    const caption = camelCaseToRegularText(key);
    const value = result[key];
    if (typeof value === "object") {
      let message = await sendReportResult(value, level + 1);
      let spaces = [];
      for (let i = 0; i < level; i++) {
        spaces.push("  ");
      }
      messages = [
        ...messages,
        [spaces.join(""), `${caption}:`].join(" "),
        ...message
      ];
    } else {
      let spaces = [];
      for (let i = 0; i < level; i++) {
        spaces.push("  ");
      }
      const message = [spaces.join(""), `${caption}:`, `**${value}**`].join(
        " "
      );
      messages.push(message);
    }
  }
  if (level === 0) {
    // console.log("result", result)
    await sendMessageToReportingChannel(messages.join("\n"));
    // for (const message of messages) {
    //   await sendMessageToReportingChannel(message);
    // }
  } else {
    return messages;
  }
};
exports.sendReportResult = sendReportResult;

exports.initDiscordWebhook = async webhookUrl => {
  discordWebhookUrl = webhookUrl;
  // await axios.post(discordWebhookUrl, {
  //   content: "I'm now alive!"
  // });
};
