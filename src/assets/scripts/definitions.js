var pug = require('pug')

Image.prototype.load = function( url, onprogress, onloadstart, onloadend ) {
    var thisImg = this,
        xmlHTTP = new XMLHttpRequest();

    thisImg.completedPercentage = 0;

    xmlHTTP.open( 'GET', url , true );
    xmlHTTP.responseType = 'arraybuffer';

    xmlHTTP.onload = function( e ) {
        var h = xmlHTTP.getAllResponseHeaders(),
            m = h.match( /^Content-Type\:\s*(.*?)$/mi ),
            mimeType = m[ 1 ] || 'image/png';
            // Remove your progress bar or whatever here. Load is done.

        var blob = new Blob( [ this.response ], { type: mimeType } );
        thisImg.blob = blob
        thisImg.src = window.URL.createObjectURL( blob );
        if ( onloadend ) onloadend(thisImg, e);
    };

    xmlHTTP.onprogress = function( e ) {
        if ( e.lengthComputable )
            thisImg.completedPercentage = parseInt( ( e.loaded / e.total ) * 100 );
        // Update your progress bar here. Make sure to check if the progress value
        // has changed to avoid spamming the DOM.
        // Something like: 
        // if ( prevValue != thisImage completedPercentage ) display_progress();

        if ( onprogress ) onprogress(thisImg, e);
    };

    xmlHTTP.onloadstart = function() {
        // Display your progress bar here, starting at 0
        thisImg.completedPercentage = 0;
        if ( onloadstart ) onloadstart(thisImg, e);
    };

    xmlHTTP.onloadend = function() {
        // You can also remove your progress bar here, if you like.
        thisImg.completedPercentage = 100;
    }

    xmlHTTP.send();
};

class thumb
{
    constructor(id)
    {
        this.id = id
        this.author = -1
        this.creator_id = -1
        this.status = -1
        this.source = -1
        this.sources = -1
        this.tags = -1
        this.artist = -1
        this.description = -1
        this.favorites = -1
        this.score = -1
        this.rating = -1
        this.parent_id = -1
        this.has_children = -1
        this.children = -1
        this.has_notes = -1
        this.has_comments = -1
        this.md5 = -1
        this.file_url = -1
        this.file_ext = -1
        this.file_size = -1
        this.width = -1
        this.height = -1
        this.sample_url = -1
        this.sample_width = -1
        this.sample_height = -1
        this.preview_url = -1
        this.preview_width = -1
        this.preview_height = -1
        this.delreason = -1
        this.format = -1
    }

    render_thumbnail()
    {
        var $template = $(pug.compileFile(__dirname + '/../templates/thumbnail.pug')(this))
        var $image = $template.find('.sample')
        var $load = $(`<img src='${this.sample_url}'/>`).on('load',() =>
        {
            $image.attr('src', this.sample_url)
        })

        $image.attr('src', this.sample_url)

        return $template
    }
}

class post
{
    constructor(id)
    {
        this.id = id
        this.author = -1
        this.creator_id = -1
        this.status = -1
        this.source = -1
        this.sources = -1
        this.tags = -1
        this.artist = -1
        this.description = -1
        this.favorites = -1
        this.score = -1
        this.rating = -1
        this.parent_id = -1
        this.has_children = -1
        this.children = -1
        this.has_notes = -1
        this.has_comments = -1
        this.md5 = -1
        this.file_url = -1
        this.file_ext = -1
        this.file_size = -1
        this.width = -1
        this.height = -1
        this.sample_url = -1
        this.sample_width = -1
        this.sample_height = -1
        this.preview_url = -1
        this.preview_width = -1
        this.preview_height = -1
        this.delreason = -1
        this.format = -1
    }

    render_page()
    {
        if (this.format == 'image')
        {
            var $template = $(pug.compileFile(__dirname + '/../templates/post.pug')(this))
            var image = new Image()
            var $image = $template.find('.image')
            var $loading = $template.find('.loading')

            image.load(this.file_url, (img, e) =>
            {
                //console.log(img.completedPercentage)
                var progress = img.completedPercentage
                $loading.css('width', `${progress}%`)
                //console.log(img)
                //console.log(e)
            }, null, (img, e) =>
            {
                //console.log(img)
                //console.log(e)
                $loading.remove()
                $image.attr('src', img.src)
            })

            return $template
        }
        else if (this.format == 'video')
        {
            return $(pug.compileFile(__dirname + '/../templates/videopost.pug')(this))
        }
    }
}


module.exports = {}
module.exports.thumb = thumb
module.exports.post = post