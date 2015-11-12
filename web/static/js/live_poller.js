import {Socket} from "deps/phoenix/web/static/js/phoenix"

export var LivePoller = {
  init: function() {
    if (!$("#poll-id")) {
      return;
    }
    console.log("LivePoller init")
    let socket = this.createSocket()
    let pollId = 7
    let pollChannel = socket.channel("polls:" + pollId, {})
    let self = this
    pollChannel.on("new_vote", vote => {
      console.log("Received new vote: ", vote)
        console.log("Entry Id: ", vote["entry_id"])
      self.updateDisplay(vote["entry_id"])
    })
    pollChannel.join()
      .receive("ok", resp => {
        console.log("Joined")
      })
      .receive("error", reason => console.log("Error: ", reason))
    $(".vote").on("click", function(event) {
      event.preventDefault()
      let entry_id = $(event.currentTarget).data("entry-id")
      pollChannel.push("new_vote", { entry_id: entry_id })
    })
  },
  createSocket: function() {
    let socket = new Socket("/socket",
      {
        logger: (kind, msg, data) => {
          console.log(`${kind}: ${msg}`, data)
        },
        params: { token: window.userToken }
      }
    )
    socket.connect()
    socket.onOpen(() => console.log("Connected"))
    return socket
  },
  updateDisplay: function(entry_id) {
    let total = (+$("#total-entries").val() + 1)
    $("#total-entries").val(total)
    $("li.entry").each(function() {
      let li = $(this)
      if (entry_id == li.data("entry-id")) {
        let new_votes = +(li.data("entry-votes")) + 1
        let percent = ((new_votes / total) * 100).toFixed(2)
        console.log(total, new_votes, percent)
        li.find(".score").text(new_votes + " votes (" + percent + "%)" )
        li.data("entry-votes", new_votes)
      } else {
        let new_votes = li.data("entry-votes")
        let percent = ((new_votes / total) * 100).toFixed(2)
        console.log(total, new_votes, percent)
        li.find(".score").text(new_votes + " votes (" + percent + "%)" )
      }
    })
  }
}
