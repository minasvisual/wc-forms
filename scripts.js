function send(e) {
  e.preventDefault()
  const form = e.target; 
  const values = Object.fromEntries(new FormData(form));
  console.log('Submited validation', e.valid)
  console.log('Submited validation errors', e.errors)
  console.log('Submited data parsed', e.detail)
} 

document.addEventListener('DOMContentLoaded', () => {
  console.log('onload' ) 

  document.querySelector('form').addEventListener('submit', () => console.log('submit'))
  document.querySelector('form').addEventListener('submited', send)

  let input = document.querySelector('form-input[name="test"]')
  input.addEventListener('typing', e => console.log('typing', e.detail))
  input.addEventListener('change', e => console.log('change', e.detail))
   
})