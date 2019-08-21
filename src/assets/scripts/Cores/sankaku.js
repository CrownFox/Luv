var $ = require('jquery')
var defs = require('../definitions')
var common = require('../common')

class sankaku
{
    constructor()
    {
        this.username = 'rinarenna'
        this.password = '562923dcee0a637d3c16c86f010701d0'
        this.page = 1
        this.last_id = 0
        this.tags = null
        this.loading = false
        this.firstload = false
    }

    fetch_list(tags = null, page, callback = (posts) => {})
    {
        this.page = page

        var URL = `http://chan.sankakucomplex.com/post/index?page=${page}`
        
        URL += common.parse_tags(this, tags)

        if (page > 1)
        {
            URL += `&next=${this.last_id}`
        }

        console.log(URL)
        $.get(URL, (response) =>
        {
            var ghost = document.implementation.createHTMLDocument('virtual')
            var posts = {}

            $(response, ghost).find('span.thumb').each((index, element) =>
            {
                var id = element.id.slice(1, element.id.length)
                posts[id] = new defs.thumb(id)

                posts[id].sample_url = 'https://' + $(element).find('img').attr('src')
                posts[id].sample_height= $(element).find('img').attr('height')
                posts[id].sample_width = $(element).find('img').attr('width')
                posts[id].format = 'image'
                posts[id].tags = $(element).find('img').attr('title').split(' ')

                if (posts[id].tags.includes('video')
                ||  posts[id].tags.includes('animated'))
                {
                    posts[id].format = 'video'
                }
                else
                {
                    posts[id].format = 'image'
                }

                this.last_id = id
            })

            //console.log(response)
            callback(posts)
        })
    }

    fetch_post(id, callback = (post) => {})
    {
        var URL = `https://chan.sankakucomplex.com/post/show/${id}`

        $.get(URL, (response) =>
        {
            var ghost = document.implementation.createHTMLDocument('virtual')

            var image = $(response, ghost).find('#image')

            var newpost = new defs.post(id)

            newpost.file_url = 'https://' + image.attr('src')
            newpost.file_height = image.attr('height')
            newpost.file_width = image.attr('width')
            newpost.tags = []

            $(response, ghost).find('#tag-sidebar').children().each((index, element) =>
            {
                var newtag = element
                newtag = parse_tag(element)
                if (newtag)
                {
                    newpost.tags.push(newtag)
                }
            })

            if (image.is('img'))
            {
                newpost.format = 'image'
            }
            if (image.is('video'))
            {
                newpost.format = 'video'
            }

            callback(newpost)
        })
    }
}

function parse_tag(tag = $())
{
    if (tag != $())
    {
        var $tag = $(tag)

        if ($tag.is('li'))
        {
            return $tag.find('a').text().replace(/ /g, "_").replace('?', '')
        }
        else
        {
            return false
        }
    }
    else
    {
        return false
    }
}

module.exports = new sankaku