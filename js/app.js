/** CONSTANTS */
const unreadTab = document.querySelector("div[data-type='1']");
const readTab = document.querySelector("div[data-type='2']");
const searchTab = document.querySelector("div[data-type='3']");

const unreadList = unreadTab.firstElementChild.nextElementSibling;
const unreadText = unreadList.nextElementSibling;
const readList = readTab.firstElementChild;
const readText = readList.nextElementSibling;
const searchList = searchTab.firstElementChild.nextElementSibling;
const searchText = searchList.nextElementSibling;

const addForm = document.querySelector(".rl-add-form");
const titleInput = document.querySelector("#title");
const urlInput = document.querySelector("#url");
const tagsInput = document.querySelector("#tags");

const searchForm = document.querySelector(".rl-search-form");
const tagSearchInput = document.querySelector("#tagSearch");
const linkSearchInput = document.querySelector("#linkSearch");
const unreadCheckbox = document.querySelector("#unreadCheckbox");
const readCheckbox = document.querySelector("#readCheckbox");

const messages = {
  "validation.error.bookmark.url.size": "Ссылка не может быть пустой",
  "validation.error.bookmark.url.unique":
    "Закладка с такой ссылкой уже существует",
  "validation.error.bookmark.title.size":
    "Введите название закладки. Длина от 1 до 100 символов"
};

/** END OF CONSTANTS */

class Bookmark {
  constructor(id, title, url, tags, read) {
    this.id = id;
    this.title = title;
    this.url = url;
    this.tags = tags;
    this.read = read;
  }
}

/** REQUESTS */
// Get bookmarks
function getBookmarks(read, success, error) {
  const request = new XMLHttpRequest();
  request.open("GET", `http://localhost:8080/api/bookmarks?read=${read}`, true);
  request.addEventListener("load", function() {
    if (request.status === 200) {
      success(JSON.parse(request.responseText));
    } else {
      error(JSON.parse(request.responseText));
    }
  });
  request.send();
}

// Add bookmark
function addBookmark(bookmark, success, error) {
  const request = new XMLHttpRequest();
  request.open("POST", "http://localhost:8080/api/bookmarks", true);
  request.addEventListener("readystatechange", function() {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        success();
      } else {
        error(JSON.parse(request.response));
      }
    }
  });
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(bookmark));
}

// Search
function search(searchParams, success, error) {
  url = "http://localhost:8080/api/bookmarks/search";
  searchParams.forEach((param, i) => {
    urlParam = `${i > 0 ? "&" : "?"}${param.key}=${param.value}`;
    url += urlParam;
  });
  const request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.addEventListener("load", function() {
    if (request.status === 200) {
      success(JSON.parse(request.responseText));
    } else {
      error(JSON.parse(request.responseText));
    }
  });
  request.send();
}

// Update read status
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

// Delete bookmark
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

/** END OF REQUESTS */

function fillTags(tags) {
  const tagWrapper = document.createElement("div");
  tags.forEach(tag => {
    const tagElem = document.createElement("a");
    tagElem.setAttribute("href", "#");
    tagElem.classList.add("chip");
    tagElem.classList.add("rl-tag");
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
                                <i class="small material-icons right">delete</i>
                            </a>
                        </div>
                    </div>`;
    list.appendChild(li);
  });
}

function fillUnread() {
  unreadList.innerHTML = "";
  getBookmarks(false, function(bookmarks) {
    if (bookmarks.length > 0) {
      unreadText.classList.add("hide");
      unreadList.classList.remove("hide");
      fillBookmarkList(unreadList, bookmarks);
    } else {
      unreadText.classList.remove("hide");
      unreadList.classList.add("hide");
    }
  });
}

function fillRead() {
  readList.innerHTML = "";
  getBookmarks(true, function(bookmarks) {
    if (bookmarks.length > 0) {
      readText.classList.add("hide");
      readList.classList.remove("hide");
      fillBookmarkList(readList, bookmarks);
    } else {
      readText.classList.remove("hide");
      readList.classList.add("hide");
    }
  });
}

function init() {
  fillUnread();
}

function parseTags(text) {
  text = text.trim();
  list = [];
  if (text !== "") {
    list = text.substring(1).split("#");
  }
  return list;
}

function searchForTag(tag) {
  tagSearchInput.value = tag;
  $("ul.tabs").tabs("select_tab", "searchTab");
  searchForm.dispatchEvent(new Event("submit"));
}

function handleListClick(e, callback) {
  if (e.target.parentElement.classList.contains("rl-delete")) {
    e.preventDefault();
    const link = e.target.parentElement;
    const id = link.getAttribute("data-id");
    deleteBookmark(id, callback);
  } else if (e.target.classList.contains("rl-tag")) {
    searchForTag(e.target.innerHTML);
  }
}

function emptySearchForm() {
  tagSearchInput.value = "";
  linkSearchInput.value = "";
  unreadCheckbox.checked = false;
  readCheckbox.checked = false;
  searchList.innerHTML = "";
  searchList.classList.add("hide");
}

/** EVENT LISTENERS */
unreadList.addEventListener("change", function(e) {
  id = e.target.getAttribute("data-id");
  updateRead(+id, true, fillUnread);
});

readList.addEventListener("change", function(e) {
  id = e.target.getAttribute("data-id");
  updateRead(+id, false, fillRead);
});

unreadList.addEventListener("click", function(e) {
  handleListClick(e, fillUnread);
});

readList.addEventListener("click", function(e) {
  handleListClick(e, fillRead);
});

addForm.addEventListener("submit", function(e) {
  e.preventDefault();
  bookmark = new Bookmark();
  bookmark.title = titleInput.value;
  bookmark.url = urlInput.value;
  bookmark.tags = parseTags(tagsInput.value);
  addBookmark(
    bookmark,
    function() {
      $("#addBookmarkModal").modal("open");
      titleInput.value = "";
      urlInput.value = "";
      tagsInput.value = "";
      titleInput.classList.remove("valid");
      urlInput.classList.remove("valid");
      tagsInput.classList.remove("valid");
      fillUnread();
    },
    function(response) {
      const input = document.querySelector(`#${response.field}`);
      const label = input.nextElementSibling;
      label.setAttribute("data-error", messages[response.code]);
      input.classList.add("invalid");
    }
  );
});

addForm.addEventListener("keydown", function(e) {
  titleInput.classList.remove("invalid");
  urlInput.classList.remove("invalid");
});

searchForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const searchParams = [];
  if (tagSearchInput.value.trim() !== "") {
    searchParams.push({ key: "tag", value: tagSearchInput.value.trim() });
  }
  if (linkSearchInput.value.trim() !== "") {
    searchParams.push({ key: "link", value: linkSearchInput.value.trim() });
  }
  if (unreadCheckbox.checked) {
    searchParams.push({ key: "unread", value: unreadCheckbox.checked });
  }
  if (readCheckbox.checked) {
    searchParams.push({ key: "read", value: readCheckbox.checked });
  }
  searchList.innerHTML = "";
  search(searchParams, function(bookmarks) {
    if (bookmarks.length > 0) {
      searchText.classList.add("hide");
      searchList.classList.remove("hide");
      fillBookmarkList(searchList, bookmarks);
    } else {
      searchText.classList.remove("hide");
      searchList.classList.add("hide");
    }
  });
});

/** END OF EVENT LISTENERS */

$(document).ready(function() {
  $("#addBookmarkModal").modal();
  $("#deleteBookmarkModal").modal();
  $("ul.tabs").tabs({
    onShow: function(tab) {
      switch (tab[0].getAttribute("data-type")) {
        case "1":
          emptySearchForm();
          fillUnread();
          break;
        case "2":
          emptySearchForm();
          fillRead();
          break;
      }
    }
  });
});

init();
