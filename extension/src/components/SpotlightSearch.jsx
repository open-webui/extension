import { useState, useEffect } from "react";

export const SpotlightSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e) => {
      if (
        e.key === "k" &&
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
    <div className="fixed top-0 right-0 left-0 bottom-0 w-full min-h-screen h-screen flex justify-center z-[9999999999] overflow-hidden overscroll-contain">
      <div className=" m-auto max-w-xl w-full pb-32">
        <div className="w-full flex flex-col justify-between py-2.5 px-3.5 rounded-2xl outline outline-1 outline-gray-900 backdrop-blur-3xl bg-gray-850/70 shadow-4xl modal-animation">
          <form className="text-gray-200 w-full" onSubmit={submitHandler}>
            <div className="flex items-center gap-2 w-full">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="size-5"
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
                className="text-xl w-full font-medium bg-transparent placeholder:text-gray-500 text-neutral-100 outline-none"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            <p className="text-right text-[0.7rem] text-neutral-300">
              Press <code>⌘K</code> to toggle
            </p>
          </form>
        </div>
      </div>
    </div>
  ) : (
    <> </>
  );
};
