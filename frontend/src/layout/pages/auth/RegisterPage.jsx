import { useState } from 'react';
import api from '../../../api/axios.js';
import * as Constants from '../../../Constants/allConstants.js';
import "../../../App.css";

function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name : "",
    last_name : "",
    email :"",
    password : "",
    password_confirmation :"",
  });
  const [errors, setErrors] = useState({});
  const [message,setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  function handleChange(event){
    const{name, value} = event.target;

    setFormData((prevoius) =>({
      ...prevoius,
      [name]: value,
    }));

    setErrors((prevoius) => ({
      ...prevoius,
      [name]: "",
    }));

    setMessage("");
  }

  async function handleSubmit(event){
    event.preventDefault();

    const newErrors = {};

    if(!formData.first_name.trim()){
      newErrors.first_name = "First name is required.";

    }
    if(!formData.last_name.trim()){
      newErrors.last_name = "Last name is required.";
    }
    if(!formData.email.trim()){
      newErrors.email = "Email is required.";
    }
    if(formData.password.length <8){
      newErrors.password = "Password must contain at least 8 characters.";
    }
    if(formData.password !== formData.password_confirmation){
      newErrors.password_confirmation = "Passwords do not match.";
    }

    setErrors(newErrors);
    setMessage("");

    if(Object.keys(newErrors).length >0){
      return;
    }
    setIsSubmitting(true);

    try{
      const response = await api.post("auth/register/" ,{
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        password_confirmation: formData.password_confirmation.trim(),
      });

      setMessage(response.data.message || "Account created successfully.");

      setFormData({
        first_name: "",
        last_name: "",
        email:"",
        password:"",
        password_confirmation:"",
      });
    }
    catch(error){
      if(error.response){
        const data = error.response.data;

        if(typeof data === 'object' && data !== null){
          const backendErrors = {};

          for(const [field,value] of Object.entries(data)){
            if(Array.isArray(value)){
              backendErrors[field] = value.join(" ");
            }else if(typeof value === "string"){
              backendErrors[field] = value;
            }
          }
          if(Object.keys(backendErrors).length>0){
            setErrors(backendErrors);
          }
          else{
            setMessage("Registration failed. Please try again.");
          }
        }else{
          setMessage("Registration failed. Please try again.");
        }
      }
      else{
        setMessage("Unable to connect to the server. Please try again.");
      }
    }finally{
      setIsSubmitting(false);
    }
  }

  return (
    <main className= "register-page">
      <section className= "register-card">
        <a className= "brand" href="/" aria-label="Northstar Store Home">
          {Constants.STORE_NAME}<span>.</span>
        </a>
        <p className= "eyebrow">{Constants.STORE_TAGLINE}</p>
        <h1>{Constants.CREATE_ACCOUNT}</h1>
        <p className= "subtitle">{Constants.SUB_TITTLE_FOR_CREATE_ACCOUNT}</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className= "name-row">
            <div className= "form-group">
              <label htmlFor= "first_name">{Constants.FIRST_NAME}</label>
              <input type="text" 
                id = "first_name"
                autoComplete="given-name"
                placeholder="Alex"
                name ="first_name" 
                value={formData.first_name} 
                onChange= {handleChange} 
                aria-invalid={Boolean(errors.first_name)}
              />
              {errors.first_name &&(
                <small className= "error">{errors.first_name}</small>
              )}
            </div>

            <div className= "form-group">
              <label htmlFor= "last_name">{Constants.LAST_NAME}</label>
              <input type="text" 
                id = "last_name"
                autoComplete="family-name"
                placeholder="Morgan"
                name ="last_name" 
                value={formData.last_name} 
                onChange= {handleChange}  
                aria-invalid={Boolean(errors.last_name)}
              />
              {errors.last_name &&(
                <small className= "error">{errors.last_name}</small>
              )}
            </div>

            <div className= "form-group">
              <label htmlFor= "email">{Constants.EMAIL}</label>
              <input type="email" 
                id = "email"
                autoComplete="email"
                placeholder="you@example.com"
                name ="email" 
                value={formData.email} 
                onChange= {handleChange}  
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email &&(
                <small className= "error">{errors.email}</small>
              )}
            </div>

            <div className= "form-group">
              <label htmlFor= "password">{Constants.PASSWORD}</label>
              <input type="password" 
                id = "password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                name ="password" 
                value={formData.password} 
                onChange= {handleChange}  
                aria-invalid={Boolean(errors.password)}
              />
              {errors.password &&(
                <small className ="error">{errors.password}</small>
              )}
            </div>

            <div className= "form-group">
              <label htmlFor= "password_confirmation">{Constants.PASSWORD_CONFIRMATION}</label>
              <input type="password" 
                id = "password_confirmation"
                autoComplete="new-password"
                placeholder="Enter your password again"
                name ="password_confirmation" 
                value={formData.password_confirmation} 
                onChange= {handleChange}  
                aria-invalid={Boolean(errors.password_confirmation)}
              />
              {errors.password_confirmation &&(
                <small className= "error">{errors.password_confirmation}</small>
              )}
            </div>

            <button className="submit-button"
            disabled = {isSubmitting}
            type = "submit">
              {isSubmitting? Constants.CREATING_ACCOUNT: Constants.SUBMIT_BUTTON}
               { !isSubmitting && (<span aria-hidden = "true">{Constants.ARROW}</span>)}
            </button>

            {message && (
              <p className="success-message" role = "status">{message}</p>
            )}
            <p className= "terms">
             {Constants.TERMS}
            </p>
          </div>
        </form>

        <div className= "login-prompt">
            {Constants.ALREADY_HAVE_ACCOUNT} <a href='/login'>Sign in</a>
        </div>
      </section>
      <aside className= "visual-panel">
        <div className= "visual-content">
          <p className= "eyebrow">{Constants.EYEBROW}</p>
          <h1>{Constants.EYEBROW_TAG_LINE}</h1>
          <p>
            {Constants.EYEBROW_CONTENT}
          </p>
        </div>
        <div className= "visual-caption">
          <span>{Constants.VISUAL_CAPTION}</span>
          <span>{Constants.ESTABLISH}</span>
        </div>
      </aside>
    </main>
  )
}

export default RegisterPage;
