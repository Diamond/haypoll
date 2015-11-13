defmodule Haypoll.PollView do
  use Haypoll.Web, :view

  def percent(_votes, 0, total_entries) do
    Float.floor((1 / total_entries) * 100)
  end

  def percent(votes, total, _total_entries) do
    Float.floor((votes / total) * 100)
  end

  def build_graph(entries, total) do
    total_entries = Enum.count(entries)
    content_tag(:div, class: "graph col-xs-12") do
      for entry <- entries, do: build_entry(entry, total, total_entries)
    end
  end

  def build_entry(entry, total, total_entries) do
    my_percent = percent(entry.votes, total, total_entries)
    content_tag(:div, entry.title, id: "entry_#{entry.id}", style: "width: #{my_percent}%; background: #{random_hex_color}", class: "graph-entry col-xs-1 text-center")
  end

  def random_hex_color do
    colors = ~w(0 1 2 3 4 5 6 7 8 9 a b c d e f)
    "##{Enum.take_random(colors, 1)}#{Enum.take_random(colors, 1)}#{Enum.take_random(colors, 1)}"
  end

end
