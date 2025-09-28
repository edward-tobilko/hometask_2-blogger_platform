export function generateBasicAuthToken(
  username = process.env.ADMIN_USERNAME ?? "admin",
  password = process.env.ADMIN_PASSWORD ?? "qwerty"
) {
  const credentials = `${username}:${password}`;
  const token = Buffer.from(credentials).toString("base64");

  return `Basic ${token}`;
}
