defmodule Haypoll.PollView do
  use Haypoll.Web, :view

  def percent(_votes, 0, total_entries) do
    Float.floor((1 / total_entries) * 100)
  end

  def percent(votes, total, _total_entries) do
    Float.floor((votes / total) * 100)
  end

  def render("user_voted.json", _data) do
    %{ status: :ok }
  end

  def show_header_text(poll) do
    if poll.closed do
      "closed"
    else
      "open"
    end
  end
end
