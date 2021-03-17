const count = localStorage.getItem('count');

window.api.run()
  .then(async () => {
    const count = await window.api.ipcRenderer.invoke('reload-successful');
    if (count < 3) location.reload();
  })
  .catch(console.log);
