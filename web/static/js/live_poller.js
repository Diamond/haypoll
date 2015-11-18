import {Socket} from "deps/phoenix/web/static/js/phoenix"

export var LivePoller = {
  chart: null,
  init: function() {
    if ($("#poll-id").length == 0) {
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
      $.ajax("/polls/" + pollId + "/user_voted")
      $("a.vote").remove()
      let data = self.updateDisplay(vote["entry_id"])
      self.updateGraph(data)
    })
    pollChannel.on("close", function(status) {
      if (status.closed) {
        $("a.vote").hide()
      } else {
        $("a.vote").show()
      }
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
    let total = +($("#total-entries").val())
    let self = this
    var data = []
    $("li.entry").each(function() {
      let li = $(this)
      if (entryId != null && entryId == li.data("entry-id")) {
        let newVotes = li.data("entry-votes") + 1
        let newTotal = self.updateTotal()
        self.updateEntry(li, newVotes, newTotal)
        data.push({
          value: newVotes,
          color: li.data('color'),
          label: li.children('.title').text()
        })
      } else {
        let newVotes = li.data("entry-votes")
        self.updateEntry(li, newVotes, total)
        data.push({
          value: newVotes,
          color: li.data('color'),
          label: li.children('.title').text()
        })
      }
    })
    return data
  },
  updateTotal: function() {
    let total = +$("#total-entries").val() + 1
    $("#total-entries").val(total)
    return total
  },
  updateEntry: function(li, newVotes, total) {
    let percent = this.getPercent(newVotes, total)
    li.find(".score").text(newVotes + " votes (" + percent + "%)" )
    li.data("entry-votes", newVotes)
  },
  getPercent: function(newVotes, total) {
    if (total == 0) {
      return 0
    } else {
      return Math.floor((newVotes / total) * 100)
    }
  },
  buildGraph: function(data) {
    let canvas = $("#my-chart").get(0).getContext("2d")
    this.chart = new Chart(canvas).Pie(data)
  },
  updateGraph: function(data) {
    if ($("#total-entries").val() == "1") {
      this.buildGraph(data)
    } else {
      for (var i = 0; i < data.length; i++) {
        this.chart.segments[i].value = data[i].value
      }
      this.chart.update()
    }
  }
}
