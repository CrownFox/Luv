// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//var $ = require('jquery')
var $ = require('jquery')
var cores = require('./assets/scripts/coreloader')
var pug = require('pug')
var selected_core = ''
var {remote} = require('electron')
var original_width = 800
var original_height = 600
var Mousetrap = require('mousetrap')
var notifications = 0
var c = require(__dirname + '/assets/scripts/common.js')

var loading = false


$(document).ready(() =>
{
    coreSetup()

    $('#page-select').change((event) =>
    {
        var page = $('#page-select').val()
        select_page(page, 'core')
    })

    $('#home-button').on('click', (event) =>
    {
        select_page('home', null)
    })

    $('#search-button').click((event) =>
    {
        var tags = $("#tag-input").val()
        var core = selected_core
        cores.get_core(core).page = 1

        select_page(core, 'core')
        $(`#core-${core}`).find('.thumbnail').remove()
        $(`#core-${core}`).find('.page-divider').remove()
        load_page(core, tags)
    })

    $('.page-selector-button').on('click', (event) =>
    {
        $('.page-selector-button').addClass('open')
        $('.page-selector-content').addClass('visible')
        event.stopPropagation()
    })

    $(window).on('click', (event) =>
    {
        $('.page-selector-button').removeClass('open')
        $('.page-selector-content').removeClass('visible')
    })

    Mousetrap.bind('ctrl+shift+i', () =>
    {
        remote.BrowserWindow.getFocusedWindow().webContents.openDevTools()
    })

    Mousetrap.bind('ctrl+shift+r', () =>
    {
        remote.BrowserWindow.getFocusedWindow().reload()
    })

    setInterval(refresh_css, 1000)
})

function coreSetup()
{
    add_core('danbooru', 'Danbooru')
    add_core('e621', 'E621')
    add_core('gelbooru', 'Gelbooru')
    add_core('realbooru', 'Realbooru')
    add_core('rule34xxx', 'Rule34.XXX')
    add_core('sankaku', 'Sankaku Channel')
    add_core('internal', 'My Collection')
}

function add_core(id = '', name = '')
{
    if (id != '')
    {
        cores.add_core(id)
    }
    //./assets/templates/corepage.pug
    $(pug.compileFile(__dirname + '/assets/templates/corepage.pug')({id:id})).appendTo("#home").hide()

    $(`<div class='option' value="${id}">${name}</div>`).appendTo('.page-selector-content').on('click', (event) =>
    {
        selected_core = id
        $('.page-selector-button').text(name)
        select_page(id, 'core')
    })
}

function load_page(corename = '', tags = null)
{
    var core = cores.get_core(corename)
    if (core.loading == false)
    {
        core.loading = true

        if (tags)
        {
            core.page = 1
        }
    
        core.fetch_list(tags, core.page, (posts) =>
        {
            var stock = Object.keys(posts).length

            $.each(posts, (id, post) =>
            {
                if (post.sample_url != null)
                {
                    var newpost = $(post.render_thumbnail()).insertBefore($('#core-' + corename).find('.scroll-text'))
                    var newpost_img = newpost.find('img')
                    newpost.attr('core', corename)

                    newpost_img.on('click', (event) =>
                    {
                        var core = newpost.attr('core')
                        var id = newpost.attr('id')
    
                        console.log(post)
                        load_image(core, id, post)
                    })

                    if (corename == 'internal')
                    {
                        newpost_img.on('contextmenu', (event) =>
                        {
                            var core = cores.get_core(newpost.attr('core'))
                            var id = newpost.attr('id')
                            console.log(post)

                            c.dialog({
                                title: `Delete [${id}]?`,
                                text: `Are you sure you want to delete this post? This operation cannot be undone!`,
                                options:[
                                    {
                                        type: 'button',
                                        text: 'Confirm',
                                        value: true
                                    },
                                    {
                                        type: 'button',
                                        text: 'Cancel',
                                        value: false
                                    }
                                ]
                            }, (value) =>
                            {
                                if (value == true)
                                {
                                    core.delete_post(id, () =>
                                    {
                                        console.log('Post ' + id + ' deleted!')
        
                                        newpost.remove()
                                    })
                                }
                            })
                        })
                    }
    
    
                    if (core.thumbnail_override != null)
                    {
                        newpost.css('max-width', core.thumbnail_override.width)
                        newpost.css('max-height', core.thumbnail_override.height)
                    }
                }
    
                stock -= 1
            })
            
            if (stock <= 0)
            {
                core.loading = false
            }
        })
    }
}

function next_page(corename = '')
{
    var core = cores.get_core(corename)
    core.page += 1
}

function select_page(page, type)
{
    $('.page').hide()

    if (page == 'home')
    {
        $('#home').show()
    }
    else
    {
        if (type == 'core')
        {
            $('.page').hide()
            $("#home").show()

            $('.core-page').hide()

            var core = cores.get_core(page)
            if (core.firstload == false)
            {
                load_page(page)
                core.firstload = true
            }

            $('#core-' + page).show()

            $('#core-' + page).on('scroll', (event) =>
            {
                var $content = $('#core-' + page)
                var top = $content.scrollTop()
                var height = $content.prop('scrollHeight')
                var offset = $content.prop('offsetHeight')
        
                if(top === (height - offset))
                {
                    var core = cores.get_core(page)
                    if (core.loading != true)
                    {
                        next_page(page)
                        $(`<div class='page-divider'>Page ${core.page}</div>`).insertBefore($content.find('.scroll-text'))
                        load_page(page)
                        console.log(cores.get_core(page).page)
                        console.log(cores.get_core(page).last_id)
                    }
                }
        
                console.log('Scroll...')
            })
        }
        if (type == 'image')
        {
            $('#home').hide()
            $('#page-' + page).show()
        }
    }
}

function load_image(corename, id, thumb)
{
    var core = cores.get_core(corename)

    core.fetch_post(id, (post) =>
    {
        post.core = corename

        var div = $(`<div id='page-${id}' class='image-page page'></div>`)
        post.render_page().appendTo(div)
        $(div).appendTo('#pages').hide()

        var $image_container = $(div).find('.image-container')
        $image_container.data({
            post: post
        })

        var pagebutton = $(`<div id='button-${id}' class='page-button'></div>`).appendTo('#page-buttons')
        console.log('Sample URL is: ' + thumb.sample_url)
        $(pagebutton).css('background-image', `url("${thumb.sample_url}")`)
        $(pagebutton).css('background-size', `cover`)

        pagebutton.on('click', (event) =>
        {
            select_page(id, 'image')
        })

        pagebutton.on('contextmenu', (event) =>
        {
            if ($(`#page-${id}`).is(':visible'))
            {
                select_page('home')
            }

            $(`#page-${id}`).remove()
            $(`#button-${id}`).remove()
        })

        $image_container.on('click', (event) =>
        {
            console.log('clicky~!')

            if ($image_container.hasClass('fill'))
            {
                $image_container.removeClass('fill')
            }
            else
            {
                $image_container.addClass('fill')
            }
        })

        if (corename != 'internal' && post.format == 'image')
        {
            $image_container.on('contextmenu', (event) =>
            {
                notification(`Downloading [${post.id}]`)

                console.log('Right clicky~!')
    
                var internal = cores.get_core('internal')
                internal.save_post($image_container.data().post, __dirname, (data) => 
                {
                    notification(`[${data.origin_id}] finished`)
                })

            })
        }
    })
}

function refresh_css()
{
	$('link').each((index, element) =>
	{
        var path = $(element).attr('href').split('?')[0]
        $(element).attr('href', `${path}?${new Date().getTime()}`)
	})
}

function minimize()
{
    remote.BrowserWindow.getFocusedWindow().minimize()
}
function maxtoggle()
{
    var window = remote.BrowserWindow.getFocusedWindow()
    window.maximize()
}
function closeWindow()
{
    window.close()
}

async function notification(text)
{
    var offset = notifications
    notifications += 1

    var div = $(`<div class='notification'>${text}</div>`)
        .appendTo('body')

    setTimeout(() =>
    {
        div
            .css('bottom', `-24px`)
            .css('height', '24px')
            .animate({bottom: `${offset*24}px` /*'0px'*/}, () => 
            {
                setTimeout(() =>
                {
                    div.animate({bottom: `-24px`}, () =>
                    {
                        div.remove()
                        notifications -= 1
                    })
                }, 2000)
            })
    }, 1)
    
}