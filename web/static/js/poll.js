export var Poll = {
  load: function() {
    this.setupAddEntry()
    this.refreshEvents()
  },
  setupAddEntry: function() {
    var self = this
    $("#add-entry").on("click", function(event) {
      event.preventDefault()
      self.cloneEntry()
    })
  },
  refreshEvents: function() {
    $(".remove-entry").on("click", function(event) {
      event.preventDefault()
      $(event.currentTarget).parents(".entry").remove()
    })
  },
  cloneEntry: function() {
    let new_entry = $("#entries .entry:first").clone()
    new_entry.find("input[type=text]").val("")
    new_entry.appendTo("#entries")
    this.refreshEvents()
  }
}
