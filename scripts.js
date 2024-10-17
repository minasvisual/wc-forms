 
function send(e) {
  e.preventDefault()
  const form = e.target; 
  const values = Object.fromEntries(new FormData(form));
  console.log('Submited', values)
} 

document.querySelector('form').addEventListener('submit', send)

let input = document.querySelector('form-input[name="test"]')
input.addEventListener('typing', e => console.log('typing', e.detail))
input.addEventListener('change', e => console.log('change', e.detail))