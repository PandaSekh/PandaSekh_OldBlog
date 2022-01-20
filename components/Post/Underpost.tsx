import { stringToDate } from "src/utils";

export default function UnderPost({publishedDate, ttr}: {publishedDate: string, ttr: string}){
	return <div className="flex flex-row gap-x-2 items-center justify-center text-gray text-lg mb-2">
		<span>{stringToDate(publishedDate)}</span>
		-
		<span>{ttr}</span>
	</div>
}