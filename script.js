const contentElementTag = document.querySelector(".content");
const loader = document.querySelector(".loader");
const playButton = document.querySelector(".playBtn");
let AudioTextData = null;

const fetchAudioTextData = async () => {
  try {
    let data = await fetch("./assets/data.json");
    data = await data.json();
    return data?.WORDS_WITH_TIMINGS;
  } catch {
    return [];
  }
};

const fetchAudioAssets = async () => {
  const [AudioTextData] = await Promise.all([fetchAudioTextData()]);
  return AudioTextData;
};

const createInitialTexts = (data, elementNodeToAttachTexts) => {
  const fragment = document.createDocumentFragment();
  data.forEach((entry) => {
    if (entry) {
      const spanTag = document.createElement("span");
      spanTag.textContent = ` ${entry.text}`;
      spanTag.setAttribute("id", `${entry.sequenceNo}`);
      fragment.appendChild(spanTag);
    }
  });
  elementNodeToAttachTexts.innerHTML = "";
  elementNodeToAttachTexts.appendChild(fragment);
};

const colorText = (entry) => {
  if (entry) {
    const spanTag = document.getElementById(`${entry.sequenceNo}`);
    spanTag.classList.add("colored");
  }
};

const resetColorOfCompleteTexts = (data) => {
  data.forEach((entry) => {
    if (entry) {
      const spanTag = document.getElementById(`${entry.sequenceNo}`);
      spanTag.classList.remove("colored");
    }
  });
};

const getAudioSegmentTimeInMS = (time) => {
  const firstPart = Number(String(time).split(".")[0]) * 1000;
  const secondPart = String(time).split(".")[1]
    ? Number("." + String(time).split(".")[1]) * 1000
    : 0;
  return firstPart + secondPart;
};

function StartColoringTexts(data) {
  let audioSegmentIndex = 0;
  let startTime = Date.now();
  let reqFrameId = requestAnimationFrame(() => {
    coloringUtil(data);
  });

  function coloringUtil(data) {
    if (audioSegmentIndex >= data.length) {
      cancelAnimationFrame(reqFrameId);
      return;
    }
    const timeElapsed = Date.now() - startTime;
    if (
      timeElapsed > getAudioSegmentTimeInMS(data[audioSegmentIndex]?.startTime)
    ) {
      colorText(data[audioSegmentIndex]);
      audioSegmentIndex++;
    }
    cancelAnimationFrame(reqFrameId);
    reqFrameId = requestAnimationFrame(() => {
      coloringUtil(data);
    });
  }
}

const UILogicFunction = async () => {
  AudioTextData = await fetchAudioAssets();
  createInitialTexts(AudioTextData, contentElementTag);
};
UILogicFunction();

playButton.addEventListener("click", () => {
  audioElement.play();
  StartColoringTexts(AudioTextData);
});

// audio:-

const audioElement = new Audio("./assets/audio.mp3");

audioElement.addEventListener("canplay", () => {
  loader.style.display = "none";
  playButton.style.display = "flex";
});

audioElement.addEventListener("playing", () => {
  resetColorOfCompleteTexts(AudioTextData);
  playButton.style.display = "none";
});

audioElement.addEventListener("ended", () => {
  playButton.style.display = "flex";
});
