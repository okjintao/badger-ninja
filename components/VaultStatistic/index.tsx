interface Props {
  title: string;
  value: string | number | boolean;
  link?: string;
}

function VaultStatistic({ title, value, link }: Props): JSX.Element {
  return (
    <>
      <div className="flex-col">
        <div className="text-sm text-gray-400">
          {title}
        </div>
        <div className={`text-md ${link ? " text-mint cursor-pointer" : ""}`} onClick={() => {
          if (link) {
            window.open(link);
          }
        }}>
          {value}
        </div>
      </div>
    </>
  )
}

export default VaultStatistic;
