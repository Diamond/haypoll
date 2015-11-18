defmodule Haypoll.PollController do
  use Haypoll.Web, :controller

  alias Haypoll.Poll
  alias Haypoll.Entry

  plug :scrub_params, "poll" when action in [:create, :update]

  def index(conn, _params) do
    polls = Repo.all(Poll)
    render(conn, "index.html", polls: polls)
  end

  def new(conn, _params) do
    changeset = %Poll{}
    |> Repo.preload(:entries)
    |> Poll.changeset
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"poll" => poll_params}) do
    case create_poll(poll_params) do
      {:ok, _poll} ->
        conn
        |> put_flash(:info, "Poll created successfully.")
        |> redirect(to: poll_path(conn, :index))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  defp create_poll(poll_params) do
    Repo.transaction fn ->
      changeset = Poll.changeset(%Poll{}, poll_params)

      case Repo.insert(changeset) do
        {:ok, poll} ->
          Enum.map poll_params["entries"], fn entry ->
            entry = build(poll, :entries, %{title: entry})
            Repo.insert! entry
          end
        {:error, changeset} ->
          Repo.rollback changeset
      end
    end
  end

  def show(conn, %{"id" => id}) do
    poll = Repo.get!(Poll, id)
    entries = Repo.all(from e in Entry,
                       where: e.poll_id == ^id,
                       order_by: [asc: e.id])
    total = Enum.map(entries, &(&1.votes)) |> Enum.sum
    voting_restricted = Kernel.in(id, (get_session(conn, :polls) || []))
    render(conn, "show.html", poll: poll, entries: entries, total: total, can_vote: !voting_restricted)
  end

  def edit(conn, %{"id" => id}) do
    poll = Repo.get!(Poll, id) |> Repo.preload(:entries)
    changeset = Poll.changeset(poll)
    render(conn, "edit.html", poll: poll, changeset: changeset)
  end

  def update(conn, %{"id" => id, "poll" => poll_params}) do
    poll = Repo.get!(Poll, id)
    changeset = Poll.changeset(poll, poll_params)

    case Repo.update(changeset) do
      {:ok, poll} ->
        Haypoll.Endpoint.broadcast("polls:#{id}", "close", %{closed: poll.closed})
        conn
        |> put_flash(:info, "Poll updated successfully.")
        |> redirect(to: poll_path(conn, :show, poll))
      {:error, changeset} ->
        render(conn, "edit.html", poll: poll, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    poll = Repo.get!(Poll, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(poll)

    conn
    |> put_flash(:info, "Poll deleted successfully.")
    |> redirect(to: poll_path(conn, :index))
  end

  def user_voted(conn, %{"poll_id" => poll_id}) do
    user_polls = get_session(conn, :polls) || []
    conn |> put_session(:polls, [poll_id | user_polls]) |> render("user_voted.json")
  end
end
