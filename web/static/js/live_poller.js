import {Socket} from "deps/phoenix/web/static/js/phoenix"

export var LivePoller = {
  chart: null,
  init: function() {
    if (!$("#poll-id")) {
      return;
    }
    console.log("LivePoller init")
    let pollChannel = this.setupPollChannel()
    this.setupVoteButtons(pollChannel)
    let data = this.updateDisplay()
    this.buildGraph(data)
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
    pollChannel.on("new_vote", function(vote) {
      let data = self.updateDisplay(vote["entry_id"])
      self.updateGraph(data)
    })
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
    var data = []
    $("li.entry").each(function() {
      let li = $(this)
      if (entryId != null && entryId == li.data("entry-id")) {
        let newVotes = li.data("entry-votes") + 1
        self.updateEntry(li, newVotes, total)
        data.push({
          value: self.getPercent(entryId, newVotes, total),
          color: li.data('color'),
          label: li.children('.title').text()
        })
      } else {
        let newVotes = li.data("entry-votes")
        self.updateEntry(li, newVotes, total)
        data.push({
          value: self.getPercent(entryId, newVotes, total),
          color: li.data('color'),
          label: li.children('.title').text()
        })
      }
    })
    return data
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
  getPercent: function(entryId, newVotes, total) {
    return Math.floor((newVotes / total) * 100)
  },
  buildGraph: function(data) {
    let canvas = $("#myChart").get(0).getContext("2d")
    this.chart = new Chart(canvas).Pie(data)
    this.updateDisplay()
  },
  updateGraph: function(data) {
    console.log(this.chart)
      console.log(data)
    for (var i = 0; i < data.length; i++) {
      this.chart.segments[i].value = data[i].value
    }
    this.chart.update()
  }

}
