import { useState, useEffect } from "react";

export const SpotlightSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Toggle the menu when ⌘Space+Shift is pressed
  useEffect(() => {
    const down = (e) => {
      if (
        e.key === " " &&
        (e.metaKey || e.ctrlKey) &&
        (e.shiftKey || e.altKey)
      ) {
        e.preventDefault();
        setOpen((open) => !open);
        setTimeout(() => {
          document.getElementById("open-webui-search-input").focus();
        }, 0);
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();
    console.log(searchValue);
    setSearchValue("");

    window.open(`http://localhost:8080/?q=${searchValue}`, "_blank");
  };

  return open ? (
    <div className="tlwd-fixed tlwd-top-0 tlwd-right-0 tlwd-left-0 tlwd-bottom-0 tlwd-w-full tlwd-min-h-screen tlwd-h-screen tlwd-flex tlwd-justify-center tlwd-z-[9999999999] tlwd-overflow-hidden tlwd-overscroll-contain">
      <div className=" tlwd-m-auto tlwd-max-w-xl tlwd-w-full tlwd-pb-32">
        <div className="tlwd-w-full tlwd-flex tlwd-flex-col tlwd-justify-between tlwd-py-2.5 tlwd-px-3.5 tlwd-rounded-2xl tlwd-outline tlwd-outline-1 tlwd-outline-gray-850 tlwd-backdrop-blur-3xl tlwd-bg-gray-850/70 shadow-4xl modal-animation">
          <form
            className="tlwd-text-gray-200 tlwd-w-full tlwd-p-0 tlwd-m-0"
            onSubmit={submitHandler}
          >
            <div className="tlwd-flex tlwd-items-center tlwd-gap-2 tlwd-w-full">
              <div className=" tlwd-flex tlwd-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="tlwd-size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
              <input
                id="open-webui-search-input"
                placeholder="Search Open WebUI"
                className="tlwd-p-0 tlwd-m-0 tlwd-text-xl tlwd-w-full tlwd-font-medium tlwd-bg-transparent tlwd-border-none placeholder:tlwd-text-gray-500 tlwd-text-neutral-100 tlwd-outline-none"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                autoComplete="off"
              />
            </div>

            <p className="tlwd-text-right tlwd-text-[0.7rem] tlwd-p-0 tlwd-m-0 tlwd-text-neutral-300">
              Press ⌘Space+Shift to toggle
            </p>
          </form>
        </div>
      </div>
    </div>
  ) : (
    <> </>
  );
};
