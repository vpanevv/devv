using System.Runtime.InteropServices;

namespace MovieApp.Web.Models
{
    public enum TitleType
    {
        Movie = 1,
        Series = 2,
    }

    public class Title
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public TitleType Type { get; set; }
        public int ReleaseYear { get; set; }
        public string? Description { get; set; }
        public string? PosterUrl { get; set; }
        public string? TrailerUrl { get; set; }

        public decimal AverageRating { get; set; }
        public DateTime CreatedAt { get; set; }
        // public ICollection<Review> Reviews { get; set; } = New List<Review>();
    }
}