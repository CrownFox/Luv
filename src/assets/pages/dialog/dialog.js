var ipc = require('electron').ipcRenderer
var remote = require('electron').remote
var $ = require('jquery')

console.log('I show up here!')

ipc.on('prepare', (e, data) =>
{
    var parent = remote.getCurrentWindow().getParentWindow()

    console.log(data)
    $('#title').text(data.title)
    $('#textarea').text(data.text)
    
    $.each(data.options, (n, v) =>
    {
        if (v.type == 'button')
        {
            var button = $(`<div class='button'>${v.text}</div>`).data({value:v.value}).appendTo('#actionarea').on('click', () =>
            {
                var value = $(button).data().value
                
                parent.webContents.send('dialog_' + data.id, value)
                remote.getCurrentWindow().close()
            })
        }
    })
})