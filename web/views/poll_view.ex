defmodule Haypoll.PollView do
  use Haypoll.Web, :view

  def percent(votes, total) do
    Float.round((votes / total) * 100, 2)
  end
end
