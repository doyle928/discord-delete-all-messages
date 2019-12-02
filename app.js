const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");

client.on("ready", () => {
  console.log("started");

  chanArray = [];
  client.channels.map(chan => {
    if (chan.type === "text" || chan.type === "dm") {
      chanArray.push(chan);
    }
  });
  console.log(chanArray.length);

  async function deleteMessage(msg) {
    await waitFor(3000);
    msg
      .delete()
      .then(console.log("deleted - ", msg.content))
      .catch("error");
  }
  let j = 0;

  const waitFor = ms => new Promise(r => setTimeout(r, ms));
  const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };
  if (!Array.prototype.last) {
    Array.prototype.last = function() {
      return this[this.length - 1];
    };
  }

  function searchChannel(i, offset) {
    if (chanArray[i].type === "dm") {
      console.log(i, chanArray[i].recipient.username, ` offset - ${offset}`);
    } else {
      console.log(i, chanArray[i].name, ` offset - ${offset}`);
    }
    chanArray[i]
      .search({
        author: "", //user id
        offset: offset
      })
      .then(async res => {
        if (res.totalResults > 0) {
          console.log(
            res.totalResults,
            `offset ${offset / 25} / ${Math.floor(res.totalResults / 25)}`
          );
          // let searchTerm = chanArray[i].id; //only for not deleting messages in certain channels
          if (res.messages[0] === undefined) {
            console.log("undefined looking at different offset");
            if (offset / 25 > Math.floor(res.totalResults / 25)) {
              await waitFor(3000);
              j++;
              return searchChannel(j, 0);
            }
            await waitFor(3000);
            return searchChannel(i, offset + 25);
          }
          // if (
          //   searchTerm !== "644103122545016842" //only for not deleting messages in certain channels
          // ) {
          const start = async () => {
            await asyncForEach(res.messages, async msg => {
              await waitFor(3000);
              deleteMessage(msg.find(m => m.hit));
            });
            if (res.totalResults > 25) {
              if (Math.floor(res.totalResults / 25) >= offset / 25) {
                return searchChannel(i, offset + 25);
              }
            }
            console.log("All done!");
            j++;
            setTimeout(() => {
              return searchChannel(j, 0);
            }, 3000);
          };
          start();
          // } else {
          //   console.log("channel in do not delete list");
          //   j++;
          //   setTimeout(() => {
          //     console.log("all deleted");

          //     return searchChannel(j, 0);
          //   }, 3000);
          // }
        } else {
          j++;
          setTimeout(() => {
            console.log("none found");
            return searchChannel(j, 0);
          }, 3000);
        }
      })
      .catch(() => {
        j++;
        setTimeout(() => {
          console.log("no permissions to access");
          return searchChannel(j, 0);
        }, 3000);
      });
  }
  searchChannel(j, 0);
});
client.login(config.token);
