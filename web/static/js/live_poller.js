import {Socket} from "deps/phoenix/web/static/js/phoenix"

export var LivePoller = {
  init: function() {
    if (!$("#poll-id")) {
      return;
    }
    console.log("LivePoller init")
    let pollChannel = this.setupPollChannel()
    this.setupVoteButtons(pollChannel)
    this.updateGraphEntries()
  },
  createSocket: function() {
    let socket = new Socket("/socket", {params: { token: window.userToken }})
    socket.connect()
    socket.onOpen(() => console.log("Connected"))
    return socket
  },
  setupPollChannel: function() {
    let self = this
    let socket = this.createSocket()
    let pollId = $("#poll-id").val()
    let pollChannel = socket.channel("polls:" + pollId, {})
    pollChannel.on("new_vote", vote => { self.updateDisplay(vote["entry_id"]) })
    pollChannel.join()
      .receive("ok", resp => { console.log("Joined") })
      .receive("error", reason => console.log("Error: ", reason))
    return pollChannel
  },
  setupVoteButtons: function(pollChannel) {
    $(".vote").on("click", function(event) {
      event.preventDefault()
      let entry_id = $(event.currentTarget).data("entry-id")
      pollChannel.push("new_vote", { entry_id: entry_id })
    })
  },
  updateDisplay: function(entryId) {
    let total = this.updateTotal()
    let self = this
    $("li.entry").each(function() {
      let li = $(this)
      if (entryId == li.data("entry-id")) {
        let newVotes = li.data("entry-votes") + 1
        self.updateEntry(li, newVotes, total)
        self.updateGraph(entryId, newVotes, total)
      } else {
        let newVotes = li.data("entry-votes")
        self.updateEntry(li, newVotes, total)
        self.updateGraph(li.data("entry-id"), newVotes, total)
      }
    })
    this.updateGraphEntries()
  },
  updateTotal: function() {
    let total = (+$("#total-entries").val() + 1)
    $("#total-entries").val(total)
    return total
  },
  updateEntry: function(li, newVotes, total) {
    let percent = Math.floor((newVotes / total) * 100)
    li.find(".score").text(newVotes + " votes (" + percent + "%)" )
    li.data("entry-votes", newVotes)
  },
  updateGraph: function(entryId, newVotes, total) {
    let percent = Math.floor((newVotes / total) * 100)
    if (percent > 1) {
      $(".graph #entry_" + entryId).show()
      $(".graph #entry_" + entryId).css("width", percent + "%")
    } else {
      $(".graph #entry_" + entryId).hide()
    }
  },
  updateGraphEntries: function() {
    let offset         = 5
    let last           = $(".graph > div:last-child")
    let containerWidth = parseFloat($(".graph").css("width"))
    let remainder      = containerWidth - this.entryTotalWidth()
    let newWidth       = parseFloat(last.css("width")) + remainder - offset
    last.css("width", newWidth)
  },
  entryTotalWidth: function() {
    var total = 0
    $(".graph > div").each(function() {
      total += parseFloat($(this).css("width"))
    })
    return total
  }
}
