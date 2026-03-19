import React, { useRef, useState, useEffect } from 'react';

// Here we natively import the installed module and its configurations
// following 100% the official NPM documentation of your base boilerplate
import { Config } from 'wc-forms-kit/config';
import styles from 'wc-forms-kit/style.css?raw';
Config.stylesText = styles;

class FormPriority {
  constructor({ el, shadow, internals }) {
    this.name = el.getAttribute('name');
    this.label = el.getAttribute('label');
    
    shadow.innerHTML = `
      <div class="wc-form-outer">
        <label class="wc-form-label">${this.label}</label>
        <div class="wc-form-wrapper" style="display: flex; gap: 8px;">
          <input type="hidden" name="${this.name}" />
          <button type="button" data-val="low" style="padding: 4px 8px; border: 1px solid #ccc; cursor: pointer; background: #a7f3d0; border-radius: 4px">Low</button>
          <button type="button" data-val="medium" style="padding: 4px 8px; border: 1px solid #ccc; cursor: pointer; background: #fde047; border-radius: 4px">Medium</button>
          <button type="button" data-val="high" style="padding: 4px 8px; border: 1px solid #ccc; cursor: pointer; background: #fca5a5; border-radius: 4px">High</button>
        </div>
        <small class="wc-errors hidden" style="color:red"></small>
      </div>
    `;
    
    this.formitem = shadow.querySelector('input');
    this.erroritem = shadow.querySelector('.wc-errors');
    
    const buttons = shadow.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.formitem.value = btn.dataset.val;
        buttons.forEach(b => b.style.outline = 'none');
        btn.style.outline = '2px solid black';
        this.formitem.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }
  
  setError(error) {
    if (!error) {
       this.erroritem.innerHTML = '';
       this.erroritem.classList.add('hidden');
    } else {
       this.erroritem.innerHTML = error;
       this.erroritem.classList.remove('hidden');
    }
  }
}

Config.registerInput('priority', FormPriority);

import 'wc-forms-kit';

function App() {
  const [data, setData] = useState(null);
  const [apiUsers, setApiUsers] = useState([]);
  
  // New states for the dependent Combobox (Cascade)
  const [selectedUser, setSelectedUser] = useState(null);
  const [apiPosts, setApiPosts] = useState([]);
  
  const formRef = useRef(null);

  useEffect(() => {
    // Initial fetch of API users natively via React
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(res => res.json())
      .then(users => {
        // Formats options to the wc-forms library standard:
        const optionsFormat = users.map(u => ({
          label: `${u.name} (${u.email})`, 
          value: String(u.id)
        }));
        // Adds an empty value for 'required' to work as a placeholder
        setApiUsers([{ label: '▼ Select...', value: '' }, ...optionsFormat]);
      })
      .catch(err => console.error("Failed to fetch users", err));
  }, []);

  // Dependent hook: Triggers whenever the selected user changes
  useEffect(() => {
    if (!selectedUser) {
      setApiPosts([]);
      return;
    }
    // Temporarily clears posts to show loading state during transition
    setApiPosts([]);
    fetch(`https://jsonplaceholder.typicode.com/posts?userId=${selectedUser}`)
      .then(res => res.json())
      .then(posts => {
        // Truncates the title to avoid breaking the layout
        const optionsFormat = posts.map(p => ({
          label: p.title.substring(0, 50) + '...', 
          value: String(p.id)
        }));
        setApiPosts([{ label: '▼ Choose a Post from this User...', value: '' }, ...optionsFormat]);
      })
      .catch(err => console.error("Failed to fetch posts", err));
  }, [selectedUser]);

  useEffect(() => {
    const formElement = formRef.current;
    if (!formElement) return;

    // Listens to the custom event from the Form Component 
    const handleSubmit = (e) => {
      setData(e.detail);
    };

    // Listens to changes in any field inside the Web Component Root Wrapper
    const handleChange = (e) => {
      // Since the library emits: this.emitEvent('change', value) where bubbles: true,
      // we can catch the event in the parent formElement and check the target `<form-input>`
      if (e.target.getAttribute('name') === 'api_user') {
         setSelectedUser(e.detail); // e.detail contains exactly the final value
      }
    };

    formElement.addEventListener('submited', handleSubmit);
    formElement.addEventListener('change', handleChange);
    
    return () => {
      formElement.removeEventListener('submited', handleSubmit);
      formElement.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2>React App (Bundled) + wc-forms-kit</h2>
      <p style={{ color: '#555' }}>Bundled environment built with Vite running standard ES imports.</p>

      <form 
        is="form-control" 
        ref={formRef} 
        style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}
      >
        <form-input 
          name="username" 
          type="text" 
          label="System Name" 
          validations="required|minlen:5">
        </form-input>

        <form-input 
          name="email" 
          type="email" 
          label="E-mail" 
          validations="required|email">
        </form-input>

        <form-input 
            name="platform" 
            type="select" 
            validations="required|in:react,vue,angular" 
            label="Choose a Framework" 
            options="[{'label':'','value':''}, {'label':'React','value':'react'}, {'label':'Vue','value':'vue'}, {'label':'Angular','value':'angular'}]">
        </form-input>

        <form-input 
          name="priority" 
          type="priority" 
          label="Priority Level" 
          validations="required">
        </form-input>

        {apiUsers.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic', padding: '10px 0' }}>⏳ Loading Users Web Component via API...</div>
        ) : (
          <form-input 
            key={"usr-"+apiUsers.length}
            name="api_user" 
            type="select" 
            label="User (JSONPlaceholder React State)" 
            options={JSON.stringify(apiUsers).replace(/"/g, "'")}
            validations="required">
          </form-input>
        )}

        {/* --- MAGIC DEPENDENT COMBO BOX HERE --- */}
        {selectedUser && apiPosts.length === 0 && (
          <div style={{ color: '#666', fontStyle: 'italic', padding: '10px 0' }}>⏳ Fetching linked posts from API...</div>
        )}

        {selectedUser && apiPosts.length > 0 && (
          <div style={{ padding: '15px', background: '#f0f9ff', borderRadius: '6px', border: '1px dashed #bae6fd' }}>
            <form-input 
              key={"post-"+selectedUser+"-"+apiPosts.length}
              name="api_post" 
              type="select" 
              label={`Choose Post from User ${selectedUser}`} 
              options={JSON.stringify(apiPosts).replace(/"/g, "'")}
              validations="required">
            </form-input>
          </div>
        )}

        <button type="submit" style={{ padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Submit Native Form
        </button>
      </form>

      {data && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0 }}>Processed Payload:</h3>
          <pre style={{ margin: 0, color: '#333' }}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
