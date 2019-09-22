var dialogs = {}
var ipc = require('electron').ipcRenderer
const BrowserWindow = require('electron').remote.BrowserWindow
var ThisWindow = require('electron').remote.getCurrentWindow()

console.log(__dirname)

function parse_tags(self, tags)
{
    if (tags != null)
    {
        //Include the supplied tags and store them
        self.tags = tags
        return `&tags=${tags.split(' ').join('+')}`
    }
    else
    {
        //Check for stored tags since the user didn't supply any
        if (self.tags != null)
        {
            if (self.page > 1) //Make sure we're not starting from page 1
            {
                return `&tags=${self.tags.split(' ').join('+')}`
            }
            else //If we're on page one, empty the tags, since the user is browsing all posts by new
            {
                self.tags = null
            }
        }
    }

    return ''
}

function dialog(options, callback = (selection)=>{})
{
    var id = create_unique_id(dialog, 10)
    console.log(id)
    options.id = id

    console.log('Creating BrowserWindow')
    var dialog_window = new BrowserWindow(
    {
        title: options.title,
        width: 400,
        height: 200,
        minWidth: 400,
        minHeight: 200,
        transparent: true,
        frame: false,
        show: false,
        parent: ThisWindow,
        modal: true
    })
    console.log('BrowserWindow created')

    dialogs[id] = dialog_window


    dialog_window.loadFile(__dirname + '/../pages/dialog/dialog.html')

    dialog_window.once('ready-to-show', (e) =>
    {
        dialog_window.show()
        dialog_window.send('prepare', options)
    })
    
    ipc.once(`dialog_${id}`, (e, value) =>
    {
        callback(value)
        delete dialogs[id]
    })
}

function create_unique_id(list, length)
{
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var result = ''

    for (var i=0; i < length; i++)
    {
        result += letters[Math.floor(Math.random() * letters.length)]
    }

    if (list[result])
    {
        return create_unique_id(list, length)
    }
    else
    {
        return result
    }
}

module.exports = {
    parse_tags: parse_tags,
    dialog: dialog
}