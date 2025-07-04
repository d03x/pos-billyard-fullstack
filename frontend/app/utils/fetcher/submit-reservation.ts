import { api_url } from "../api";

export async function submitReservation(url: string, { arg }: { arg: any }) {
  const response = await fetch(`${api_url}${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    throw new Error("Gagal menyimpan reservasi");
  }

  return response.json();
}

export async function submitExtendReservation(
  url: string,
  { arg }: { arg: any }
) {
  const response = await fetch(`${api_url}${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    throw new Error("Gagal memperpanjang reservasi");
  }

  return response.json();
}
export async function mutationWithData(
  url: string,
  { arg }: { arg: any }
) {
  const response = await fetch(`${api_url}${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    throw new Error("Error while processing the request");
  }

  return response.json();
}
