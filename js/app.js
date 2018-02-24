class Bookmark {
  constructor(id, title, url, tags, read) {
    this.id = id;
    this.title = title;
    this.url = url;
    this.tags = tags;
    this.read = read;
  }
}

function getUnreadBookmarks() {
  const request = new XMLHttpRequest();
  request.open("GET", "http://localhost:8080/api/bookmarks?read=false", true);
  request.addEventListener("load", function() {
    if (request.status === 200) {
      const bookmarks = JSON.parse(request.responseText);
      fillBookmarkList(unreadList, bookmarks);
    } else {
      // error
    }
  });
  request.send();
}

function getReadBookmarks() {
  const request = new XMLHttpRequest();
  request.open("GET", "http://localhost:8080/api/bookmarks?read=true", true);
  request.addEventListener("load", function() {
    if (request.status === 200) {
      const bookmarks = JSON.parse(request.responseText);
      fillBookmarkList(readList, bookmarks);
    } else {
      // error
    }
  });
  request.send();
}

/**Tabs */
const unreadTab = document.querySelector("div[data-type='1']");
const readTab = document.querySelector("div[data-type='2']");
const searchTab = document.querySelector("div[data-type='3']");
/**List */
const unreadList = unreadTab.firstElementChild.nextElementSibling;
const readList = readTab.firstElementChild.nextElementSibling;

/**Form */
const addForm = document.querySelector(".rl-add-form");
const titleInput = document.querySelector("#title");
const linkInput = document.querySelector("#link");
const tagsInput = document.querySelector("#tags");

const searchForm = document.querySelector(".rl-search-form");
const tagSearchInput = document.querySelector("#tagSearch");
const linkSearchInput = document.querySelector("#linkSearch");
const unreadCheckbox = document.querySelector("#unreadCheckbox");
const readCheckbox = document.querySelector("#readCheckbox");

function fillTags(tags) {
  const tagWrapper = document.createElement("div");
  tags.forEach(tag => {
    const tagElem = document.createElement("div");
    tagElem.classList.add("chip");
    tagElem.innerHTML = `${tag}`;
    tagWrapper.appendChild(tagElem);
  });
  return tagWrapper.innerHTML;
}

function fillBookmarkList(list, bookmarks) {
  bookmarks.forEach(element => {
    const li = document.createElement("li");
    li.classList.add("collection-item");
    li.innerHTML = `<div class="row">
                        <div class="col s1">
                            <input type="checkbox" id="bookmark${
                              element.id
                            }" data-id="${element.id}" ${
      element.read ? "checked" : ""
    }/>
                            <label for="bookmark${element.id}"></label>
                        </div>
                        <div class="col s4">
                            <a href="${element.url}" target="_blank">${
      element.title
    }</a>
                        </div>
                        <div class="col s5">${fillTags(element.tags)}
                        </div>
                        <div class="col s2">
                            <a href="#" class="rl-delete" data-id="${
                              element.id
                            }">
                                <i class="small material-icons">delete</i>
                            </a>
                        </div>
                    </div>`;
    list.appendChild(li);
  });
}

function fillUnread() {
  unreadList.innerHTML = "";
  getUnreadBookmarks();
}

function fillRead() {
  readList.innerHTML = "";
  getReadBookmarks();
}

function init() {
  fillUnread();
}

$(document).ready(function() {
  $("ul.tabs").tabs({
    onShow: function(tab) {
      switch (tab[0].getAttribute("data-type")) {
        case "1":
          fillUnread();
          break;
        case "2":
          fillRead();
          break;
      }
    }
  });
});

function updateRead(id, read, callback) {
  const request = new XMLHttpRequest();
  request.open("PUT", `http://localhost:8080/api/bookmarks/${id}`, true);
  request.addEventListener("readystatechange", function() {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        callback();
      } else {
        console.log("Error");
      }
    }
  });
  request.setRequestHeader("Content-Type", "application/json");
  request.send(
    JSON.stringify({
      read: read
    })
  );
}

unreadList.addEventListener("change", function(e) {
  id = e.target.getAttribute("data-id");
  updateRead(+id, true, fillUnread);
});

readList.addEventListener("change", function(e) {
  id = e.target.getAttribute("data-id");
  updateRead(+id, false, fillRead);
});

function deleteBookmark(id, callback) {
  const request = new XMLHttpRequest();
  request.open("DELETE", `http://localhost:8080/api/bookmarks/${id}`, true);
  request.addEventListener("readystatechange", function() {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        callback();
      } else {
        console.log("Error");
      }
    }
  });
  request.send();
}

unreadList.addEventListener("click", function(e) {
  if (e.target.parentElement.classList.contains("rl-delete")) {
    e.preventDefault();
    const link = e.target.parentElement;
    const id = link.getAttribute("data-id");
    deleteBookmark(id, fillUnread);
  }
});

readList.addEventListener("click", function(e) {
  if (e.target.parentElement.classList.contains("rl-delete")) {
    e.preventDefault();
    const link = e.target.parentElement;
    const id = link.getAttribute("data-id");
    deleteBookmark(id, fillRead);
  }
});

function parseTags(text) {
  text = text.trim();
  list = [];
  if (text !== "") {
    list = text.substring(1).split("#");
  }
  return list;
}

function addBookmark(bookmark) {
  const request = new XMLHttpRequest();
  request.open("POST", "http://localhost:8080/api/bookmarks", true);
  request.addEventListener("readystatechange", function() {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        fillUnread();
      } else {
        console.log("Error");
      }
    }
  });
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(bookmark));
}

addForm.addEventListener("submit", function(e) {
  e.preventDefault();
  bookmark = new Bookmark();
  bookmark.title = titleInput.value;
  bookmark.url = linkInput.value;
  bookmark.tags = parseTags(tagsInput.value);
  addBookmark(bookmark);
});

function search() {
  const request = new XMLHttpRequest();
  request.open("POST", "http://localhost:8080/api/bookmarks/search", true);
  request.addEventListener("readystatechange", function() {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        fillUnread();
      } else {
        console.log("Error");
      }
    }
  });
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(bookmark));
}

searchForm.addEventListener("submit", function(e) {
  e.preventDefault();
  console.log(tagSearchInput.value);
  console.log(linkSearchInput.value);
  console.log(unreadCheckbox.checked);
  console.log(readCheckbox.checked);
  const searchParams = {};
  if (tagSearchInput.value.trim() !== "") {
    searchParams.tag = tagSearchInput.value.trim();
  }
  if (linkSearchInput.value.trim() !== "") {
    searchParams.link = linkSearchInput.value.trim();
  }
  searchParams.unread = unreadCheckbox.checked;
  searchParams.read = readCheckbox.checked;
  search(searchParams);
});

init();
