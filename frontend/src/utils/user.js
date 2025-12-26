import toast from "react-hot-toast";

class User {
  constructor() {
    this.user = null;
    this.state = false;
    this.isloading = false;
  }
  async fetch() {
    try {
      this.isloading = true;
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      this.isloading = false;
      this.state = data?.user?.personal?.auth.googleId ? true : false;
      this.user = data.user;

      return data.user;
    } catch (error) {
      toast(error.message);
    }
  }
}

const user = new User();

export default user;
