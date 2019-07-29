//const fs = require("fs");
import "./assets/styles.scss";
import * as $ from "jquery";
import * as M from "materialize-css";

import RtmClient from "./rtm-client";
import { Toast, validator, serializeFormData } from "./common";

/*const DiscoveryV1 = require("ibm-watson/discovery/v1");
var discovery = new DiscoveryV1({
  version: "2018-03-19",
  username: "fadhilfaisal@ieee.org",
  password: "fadhil@1997"
});
discovery.listEnvironments((err, res) => {
  if (err) {
    console.log(err);
  } else {
    console.log(JSON.stringify(res, null, 2));
  }
});*/
/*var VisualRecognitionV3 = require("ibm-watson/visual-recognition/v3");*/
/*var fs = require("fs");

var visualRecognition = new VisualRecognitionV3({
  url: "<service_url>",
  version: "2018-03-19",
  iam_apikey: "2bD2GP8g-R5-GHxF-_ze1oclTBYtI0O5-zjtWvS2fGuB"
});

var params = {
  images_file: fs.createReadStream("./resources/car.png")
};

visualRecognition
  .classify(params)
  .then(result => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(err => {
    console.log(err);
  });*/
/*var VisualRecognitionV3 = require("watson-developer-cloud/visual-recognition/v3");*/
//import { fs } from "fs";
//var fs = require("fs");
$(() => {
  M.AutoInit();
  let rtm = new RtmClient();

  rtm.on("ConnectionStateChanged", (newState, reason) => {
    console.log("reason", reason);
    const view = $("<div/>", {
      text: ["newState: " + newState, ", reason: ", reason].join("")
    });
    $("#log").append(view);
    if (newState == "ABORTED") {
      if (reason == "REMOTE_LOGIN") {
        Toast.error("You have already been kicked off!");
        $("#accountName").text("Agora Chatroom");

        rtm.clearState();
        $("#dialogue-list")[0].innerHTML = "";
        $("#chat-message")[0].innerHTML = "";
      }
    }
  });

  rtm.on("MessageFromPeer", (message, peerId) => {
    console.log("message " + message.text + " peerId" + peerId);
    const view = $("<div/>", {
      //text: ["message.text: " + message.text, ", peer: ", peerId].join("")
      text: [peerId + " : " + message.text].join("")
    });
    $("#log").append(view);
  });

  rtm.on("MemberJoined", ({ channelName, args }) => {
    const memberId = args[0];
    console.log("channel ", channelName, " member: ", memberId, " joined");
    const view = $("<div/>", {
      text: [
        "event: MemberJoined ",
        ", channel: ",
        channelName,
        ", memberId: ",
        memberId
      ].join("")
    });
    $("#log").append(view);
  });

  rtm.on("MemberLeft", ({ channelName, args }) => {
    const memberId = args[0];
    console.log("channel ", channelName, " member: ", memberId, " joined");
    const view = $("<div/>", {
      text: [
        "event: MemberLeft ",
        ", channel: ",
        channelName,
        ", memberId: ",
        memberId
      ].join("")
    });
    $("#log").append(view);
  });

  rtm.on("ChannelMessage", ({ channelName, args }) => {
    const [message, memberId] = args;
    console.log(
      "channel ",
      channelName,
      ", messsage: ",
      message.text,
      ", memberId: ",
      memberId
    );
    const view = $("<div/>", {
      text: [
        "event: ChannelMessage ",
        "channel: ",
        channelName,
        ", message: ",
        message.text,
        ", memberId: ",
        memberId
      ].join("")
    });
    $("#log").append(view);
  });

  $("#login").on("click", function(e) {
    e.preventDefault();

    if (rtm._logined) {
      Toast.error("You already logined");
      return;
    }

    const params = serializeFormData("loginForm");

    if (!validator(params, ["appId", "accountName"])) {
      return;
    }

    try {
      rtm.init(params.appId);
      window.rtm = rtm;
      rtm
        .login(params.accountName)
        .then(() => {
          console.log("login");
          rtm._logined = true;
          Toast.notice("Login: " + params.accountName);
        })
        .catch(err => {
          console.log(err);
        });
    } catch (err) {
      Toast.error("Login failed, please open console see more details");
      console.error(err);
    }
  });

  $("#logout").on("click", function(e) {
    e.preventDefault();
    if (!rtm._logined) {
      Toast.error("You already logout");
      return;
    }
    rtm
      .logout()
      .then(() => {
        console.log("logout");
        rtm._logined = false;
        Toast.notice("Logout: " + rtm.accountName);
      })
      .catch(err => {
        Toast.error("Logout failed, please open console see more details");
        console.log(err);
      });
  });

  $("#join").on("click", function(e) {
    e.preventDefault();
    if (!rtm._logined) {
      Toast.error("Please Login First");
      return;
    }

    const params = serializeFormData("loginForm");

    if (!validator(params, ["appId", "accountName", "channelName"])) {
      return;
    }

    if (
      rtm.channels[params.channelName] ||
      (rtm.channels[params.channelName] &&
        rtm.channels[params.channelName].joined)
    ) {
      Toast.error("You already joined");
      return;
    }

    rtm
      .joinChannel(params.channelName)
      .then(() => {
        const view = $("<div/>", {
          text: rtm.accountName + " join channel success"
        });
        $("#log").append(view);
        rtm.channels[params.channelName].joined = true;
      })
      .catch(err => {
        Toast.error(
          "Join channel failed, please open console see more details."
        );
        console.error(err);
      });
  });

  $("#leave").on("click", function(e) {
    e.preventDefault();
    if (!rtm._logined) {
      Toast.error("Please Login First");
      return;
    }

    const params = serializeFormData("loginForm");

    if (!validator(params, ["appId", "accountName", "channelName"])) {
      return;
    }

    if (
      !rtm.channels[params.channelName] ||
      (rtm.channels[params.channelName] &&
        !rtm.channels[params.channelName].joined)
    ) {
      Toast.error("You already leave");
    }

    rtm
      .leaveChannel(params.channelName)
      .then(() => {
        const view = $("<div/>", {
          text: rtm.accountName + " leave channel success"
        });
        $("#log").append(view);
        if (rtm.channels[params.channelName]) {
          rtm.channels[params.channelName].joined = false;
          rtm.channels[params.channelName] = null;
        }
      })
      .catch(err => {
        Toast.error(
          "Leave channel failed, please open console see more details."
        );
        console.error(err);
      });
  });

  $("#send_channel_message").on("click", function(e) {
    e.preventDefault();
    if (!rtm._logined) {
      Toast.error("Please Login First");
      return;
    }

    const params = serializeFormData("loginForm");

    if (
      !validator(params, [
        "appId",
        "accountName",
        "channelName",
        "channelMessage"
      ])
    ) {
      return;
    }

    if (
      !rtm.channels[params.channelName] ||
      (rtm.channels[params.channelName] &&
        !rtm.channels[params.channelName].joined)
    ) {
      Toast.error("Please Join first");
    }

    rtm
      .sendChannelMessage(params.channelMessage, params.channelName)
      .then(() => {
        const view = $("<div/>", {
          text:
            "(Channel Broadcast) " +
            rtm.accountName +
            " : " +
            params.channelMessage /*+
            " channel: " +
            params.channelName*/
        });
        $("#log").append(view);
      })
      .catch(err => {
        Toast.error(
          "Send message to channel " +
            params.channelName +
            " failed, please open console see more details."
        );
        console.error(err);
      });
  });

  $("#send_peer_message").on("click", function(e) {
    e.preventDefault();
    if (!rtm._logined) {
      Toast.error("Please Login First");
      return;
    }

    const params = serializeFormData("loginForm");

    if (!validator(params, ["appId", "accountName", "peerId", "peerMessage"])) {
      return;
    }

    rtm
      .sendPeerMessage(params.peerMessage, params.peerId)
      .then(() =>
        /*{
      const view = $("<div/>", {
        text: "account: " + rtm.accountName + " send : " + params.peerMessage + " peerId: " + params.peerId
      });
      $("#log").append(view)
    }*/
        {
          const view = $("<div/>", {
            text:
              "Me" +
              /*"(" +
              params.peerId +
              ")" +*/
              " : " +
              params.peerMessage
          });
          $("#log").append(view);
        }
      )
      .catch(err => {
        Toast.error(
          "Send message to peer " +
            params.peerId +
            " failed, please open console see more details."
        );
        console.error(err);
      });
  });

  $("#query_peer").on("click", function(e) {
    e.preventDefault();
    if (!rtm._logined) {
      Toast.error("Please Login First");
      return;
    }

    const params = serializeFormData("loginForm");

    if (!validator(params, ["appId", "accountName", "memberId"])) {
      return;
    }

    rtm
      .queryPeersOnlineStatus(params.memberId)
      .then(res => {
        const view = $("<div/>", {
          text:
            "memberId: " + params.memberId + ", online: " + res[params.memberId]
        });
        $("#log").append(view);
      })
      .catch(err => {
        Toast.error(
          "query peer online status failed, please open console see more details."
        );
        console.error(err);
      });
  });
});
