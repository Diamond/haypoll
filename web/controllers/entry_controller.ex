defmodule Haypoll.EntryController do
  use Haypoll.Web, :controller

  alias Haypoll.Entry

  def vote(conn, %{"id" => id, "poll_id" => poll_id}) do
    entry = Repo.get Entry, id
    changeset = Entry.changeset(entry, %{votes: (entry.votes + 1)})
    case Repo.update(changeset) do
      {:ok, _entry} ->
        conn
        |> put_flash(:info, "Voted successfully!")
        |> redirect(to: poll_path(conn, :show, poll_id))
      {:error, _changeset} ->
        conn
        |> put_flash(:error, "Failed to vote!")
        |> redirect(to: poll_entry_path(conn, :vote, poll_id, id))
    end
  end
end
