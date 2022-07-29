import fetch from 'node-fetch'
import { CheerioAPI, load } from 'cheerio'
import { BBSUser, BBSCredit } from './user'
const mbnSelect = 'div.pbm:last'
const totalSelect = 'ul.cl.bbda.pbm.mbm'
const creditSelect = '#psts'
async function getUserPage (uid: number) {
  const res = await fetch(`https://www.mcbbs.net/home.php?mod=space&uid=${uid}`)
  if (res.ok && res.status === 200) {
    return await res.text()
  } else {
    console.error(res.status)
    return ''
  }
}
function rawHtml (html: string, uid: number): BBSUser {
  const $ = load(html)
  if ($('#messagetext > p:nth-child(1)').html() == null) {
    // const creditinfo = load($('#psts').html() as string)
    // const mbnhtml = load($('div.pbm:last').html() as string)
    // const totalinfo = load($('ul.cl.bbda.pbm.mbm').html() as string)
    const credit = getcreditInfo($)
    const posts = nanTest(parseInt($(`${totalSelect} a:contains(回帖数)`).text().replace('回帖数', '').trim()))
    const threads = nanTest(parseInt($(`${totalSelect} a:contains(主题数)`).text().replace('主题数', '').trim()))
    const digiest = calcDigiest(credit, posts, threads)
    const group = getGroupInfo($)
    let groupText = $(`${mbnSelect} .xg1:contains("用户组")`).parent().text().split(/\s\s/)
    // console.log(group, groupText)
    // console.log(groupText.splice(0, 1))
    // console.log(groupText.splice(1, 1))
    // console.log(groupText)
    if (groupText[1] !== undefined) {
      const extraGroup = groupText[1].split(',')
      // console.log(extraGroup)
      groupText = groupText.concat(extraGroup)
      // console.log(groupText)
      groupText.splice(1, 1)
    }
    return {
      uid,
      nickname: getUserName($),
      credits: credit,
      activites: {
        post: posts,
        thread: threads,
        digiest,
        userGroups: group,
        userGroupsText: groupText.concat(),
        currentGroup: group[0],
        currentGroupText: groupText[0]
      },
      locked: false
    }
  } else {
    return {
      uid,
      nickname: null,
      credits: {
        heart: 0,
        contribute: 0,
        popularity: 0,
        diamond: 0,
        credit: 0,
        nugget: 0,
        gem: 0,
        ingot: 0,
        star: 0
      },
      activites: {
        post: 0,
        thread: 0,
        digiest: 0,
        currentGroup: null,
        currentGroupText: null,
        userGroups: null,
        userGroupsText: null
      },
      locked: true
    }
  }
}
function getUserName (html: CheerioAPI): string {
  return (html('.mt').html() as string).trim()
}
function nanTest (num: number): number {
  if (isNaN(num)) {
    return 0
  } else {
    return num
  }
}
function getcreditInfo (html: CheerioAPI): BBSCredit {
  return {
    heart: nanTest(parseInt(html(`${creditSelect} ul li:contains(爱心)`).text().trim().replace(/[爱心]/g, ''))),
    contribute: nanTest(parseInt(html(`${creditSelect} ul li:contains(贡献)`).text().trim().replace(/[贡献份]/g, ''))),
    diamond: nanTest(parseInt(html(`${creditSelect} ul li:contains(钻石)`).text().trim().replace(/[钻石颗]/g, ''))),
    popularity: nanTest(parseInt(html(`${creditSelect} ul li:contains(人气)`).text().trim().replace(/[人气点]/g, ''))),
    credit: nanTest(parseInt(html(`${creditSelect} ul li:contains(积分)`).text().trim().replace(/[积分]/g, ''))),
    nugget: nanTest(parseInt(html(`${creditSelect} ul li:contains(金粒)`).text().trim().replace(/[金粒]/g, ''))),
    gem: nanTest(parseInt(html(`${creditSelect} ul li:contains(宝石)`).text().trim().replace(/[宝石颗]/g, ''))),
    ingot: nanTest(parseInt(html(`${creditSelect} ul li:contains(金锭)`).text().trim().replace(/[金锭已弃用[\]块]/g, ''))),
    star: nanTest(parseInt(html(`${creditSelect} ul li:contains(下界)`).text().trim().replace(/[下界之星枚]/g, '')))
  }
}
export async function getUser (user: number): Promise<BBSUser> {
  return rawHtml(await getUserPage(user), user)
}
function calcDigiest (credits: BBSCredit, posts: number, threads: number): number {
  const totalPost = Math.floor((posts + threads) / 3)
  const temp1 = totalPost + threads * 2 + credits.heart * 4 + credits.diamond * 2 + credits.contribute * 10 + credits.popularity * 3
  const digiest = Math.floor((credits.credit - temp1) / 45)
  return digiest > 0 ? digiest : 0
}
function getGroupInfo (html: CheerioAPI): string[] {
  // console.log(mbnhtml.html())
  let groupText = html(`${mbnSelect} .xg1:contains("用户组")`).parent().text().replace(/(用户组)|(扩展)|,/g, '')
  const userMap: Map<RegExp, string> = new Map([
    [/管理员助理/g, 'admin_helper,'],
    [/管理员/g, 'admin,'],
    [/村民/g, 'village,'],
    [/Lv\.Inf 艺术家/g, 'artist,'],
    [/电鳗/g, 'afdian,'],
    [/超级版主/g, 'super_moderator,'],
    [/大区版主/g, 'region_moderator,'],
    [/荣誉版主/g, 'honor_moderator,'],
    [/问答区版主/g, 'qa_moderator,'],
    [/专区版主/g, 'prefecture_moderator,'],
    [/实习版主/g, 'pre_moderator,'],
    [/版主/g, 'moderator,'],
    [/Lv-\? 禁止访问/g, 'banid,'],
    [/Lv-\? 禁止发言/g, 'banpost,'],
    [/Lv-\? 禁止 IP/g, 'banip,'],
    [/哔/g, 'bi'],
    [/Lv\.12 屠龙者/g, '12,'],
    [/Lv\.11 领主/g, '11,'],
    [/Lv\.10 附魔师/g, '10,'],
    [/Lv\.9 牧场主/g, '9,'],
    [/Lv\.8 考古家/g, '8,'],
    [/Lv\.7 猎手/g, '7,'],
    [/Lv\.6 手艺人/g, '6,'],
    [/Lv\.5 农夫/g, '5,'],
    [/Lv\.4 矿工/g, '4,'],
    [/Lv\.3 挖沙工/g, '3,'],
    [/Lv\.2 采石匠/g, '2,'],
    [/Lv\.1 伐木工/g, '1,'],
    [/Lv\.0 流浪者/g, '0,'],
    [/Lv\.\? Herobrine/g, 'herobrine,'],
    [/等待验证会员/g, 'wait_verify,'],
    [/认证用户/g, 'verify,']
  ])
  for (const [k, v] of userMap) {
    groupText = groupText.replace(k, v)
  }
  groupText = groupText.replace(/\s*/g, '')
  const groups: string[] = groupText.split(',')
  groups.pop()
  const set = new Set(groups)
  return Array.from(set)
}
