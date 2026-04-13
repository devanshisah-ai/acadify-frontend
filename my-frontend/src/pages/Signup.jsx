import { useState } from "react";
import { signup } from "../api/auth";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup(form);
      console.log(res.data);
      alert("Signup successful");
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" onChange={(e)=>setForm({...form,name:e.target.value})}/>
      <input placeholder="Email" onChange={(e)=>setForm({...form,email:e.target.value})}/>
      <input placeholder="Password" type="password" onChange={(e)=>setForm({...form,password:e.target.value})}/>
      
      <select onChange={(e)=>setForm({...form,role:e.target.value})}>
        <option value="STUDENT">Student</option>
        <option value="TEACHER">Teacher</option>
      </select>

      <button type="submit">Signup</button>
    </form>
  );
}